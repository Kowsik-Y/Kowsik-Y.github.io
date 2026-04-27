"use client";

import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import TurndownService from "turndown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/image-upload";
import type { IBlog } from "@/types";

const MarkdownEditor = dynamic(() => import("@uiw/react-md-editor"), {
    ssr: false,
});

function toSlug(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function handleStyledPaste(
    event: ClipboardEvent<HTMLTextAreaElement>,
    value: string,
    onChange: (nextValue: string) => void,
) {
    const html = event.clipboardData.getData("text/html");
    const plainText = event.clipboardData.getData("text/plain");

    if (!html) return;

    event.preventDefault();

    try {
        // Native DOM parser is instantaneous and prevents Regex Denial of Service (ReDoS) crashes
        const doc = new DOMParser().parseFromString(html, "text/html");

        // Blast away hidden/heavy nodes before they ever reach the Markdown converter
        const badNodes = doc.querySelectorAll("style, script, meta, link, noscript, title, head");
        badNodes.forEach(node => node.remove());

        const turndownService = new TurndownService({
            headingStyle: "atx",
            codeBlockStyle: "fenced",
        });

        // Remove tracking attributes
        turndownService.keep(['div', 'span']); // keep them to strip tracking safely

        let markdown = turndownService.turndown(doc.body.innerHTML);

        // Fallback on error or completely empty markdown
        if (!markdown || markdown.trim() === "") {
            markdown = plainText;
        }

        if (!markdown) return;

        const target = event.currentTarget;
        const start = target.selectionStart ?? value.length;
        const end = target.selectionEnd ?? value.length;
        const nextValue = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
        onChange(nextValue);

        requestAnimationFrame(() => {
            const cursor = start + markdown.length;
            target.selectionStart = cursor;
            target.selectionEnd = cursor;
        });
    } catch (e) {
        console.error("Paste parse error fallback", e);
        // Fallback to exactly what the clipboard gives if conversion totally blows up
        if (!plainText) return;
        const target = event.currentTarget;
        const start = target.selectionStart ?? value.length;
        const end = target.selectionEnd ?? value.length;
        onChange(`${value.slice(0, start)}${plainText}${value.slice(end)}`);
    }
}

const schema = z.object({
    title: z.string().min(1, "Required"),
    slug: z.string().optional(),
    excerpt: z.string().min(1, "Required"),
    content: z.string().min(1, "Required"),
    tags: z.string().optional(),
    order: z.string().optional(),
    published: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    initial?: Partial<IBlog>;
    onSuccess: () => void;
    apiPath: string;
    editId?: string;
}

export default function BlogForm({ initial, onSuccess, apiPath, editId }: Props) {
    const [loading, setLoading] = useState(false);
    const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
    const slugWasManuallyEditedRef = useRef(
        Boolean(initial?.slug && initial?.slug !== toSlug(initial?.title ?? "")),
    );

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: initial?.title ?? "",
            slug: initial?.slug ?? "",
            excerpt: initial?.excerpt ?? "",
            content: initial?.content ?? "",
            tags: initial?.tags?.join(", ") ?? "",
            order: String(initial?.order ?? 0),
            published: initial?.published ?? true,
        },
    });

    const titleValue = watch("title");

    useEffect(() => {
        if (slugWasManuallyEditedRef.current) return;

        const nextSlug = toSlug(titleValue ?? "");
        setValue("slug", nextSlug, { shouldValidate: false, shouldDirty: true });
    }, [setValue, titleValue]);

    const slugField = register("slug");

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        const payload = {
            ...data,
            tags: (data.tags ?? "")
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            order: Number(data.order) || 0,
            published: data.published ?? true,
            coverImage,
        };

        try {
            const res = await fetch(editId ? `${apiPath}/${editId}` : apiPath, {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(editId ? "Updated!" : "Created!");
                onSuccess();
            } else {
                toast.error("Failed to save blog.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div>
                <Label className="text-foreground/80 mb-1 block">Title *</Label>
                <Input {...register("title")} className="bg-foreground/5 border-border/60 text-foreground" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
                <Label className="text-foreground/80 mb-1 block">Slug (optional)</Label>
                <Input
                    {...slugField}
                    onChange={(event) => {
                        slugWasManuallyEditedRef.current = event.target.value.trim().length > 0;
                        slugField.onChange(event);
                    }}
                    className="bg-foreground/5 border-border/60 text-foreground"
                    placeholder="my-post-title"
                />
                <p className="text-xs text-muted-foreground/80 mt-1">If empty, slug will be generated from title.</p>
            </div>

            <div>
                <Label className="text-foreground/80 mb-1 block">Excerpt *</Label>
                <Textarea
                    {...register("excerpt")}
                    rows={2}
                    className="bg-foreground/5 border-border/60 text-foreground resize-none"
                />
                {errors.excerpt && <p className="text-red-400 text-xs mt-1">{errors.excerpt.message}</p>}
            </div>

            <div>
                <Label className="text-foreground/80 mb-1 block">Content *</Label>
                <Controller
                    control={control}
                    name="content"
                    render={({ field }) => (
                        <div data-color-mode="dark" className="rounded-lg overflow-hidden border border-border/60">
                            <MarkdownEditor
                                value={field.value || ""}
                                onChange={(val) => field.onChange(val ?? "")}
                                height={320}
                                preview="edit"
                                textareaProps={{
                                    placeholder: "Write markdown content here...",
                                    onPaste: (event) => handleStyledPaste(event, field.value ?? "", field.onChange),
                                }}
                            />
                        </div>
                    )}
                />
                {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>}
            </div>

            <ImageUpload label="Cover Image" value={coverImage} onChange={setCoverImage} />

            <div>
                <Label className="text-foreground/80 mb-1 block">Tags (comma-separated)</Label>
                <Input
                    {...register("tags")}
                    className="bg-foreground/5 border-border/60 text-foreground"
                    placeholder="AI, Next.js, Portfolio"
                />
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" id="published" {...register("published")} className="accent-violet-500" />
                <Label htmlFor="published" className="text-foreground/80 text-sm">
                    Published
                </Label>
            </div>

            <div>
                <Label className="text-foreground/80 mb-1 block">Order</Label>
                <Input {...register("order")} type="number" className="bg-foreground/5 border-border/60 text-foreground w-24" />
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white dark:text-white">
                    {loading ? "Saving..." : editId ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
