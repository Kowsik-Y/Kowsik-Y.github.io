"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/image-upload";
import type { IProject } from "@/types";

const schema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    longDescription: z.string().optional(),
    techStack: z.string(),
    githubUrl: z.string().optional(),
    liveUrl: z.string().optional(),
    otherLinks: z.string().optional(), // JSON: [{label,url},...]
    featured: z.boolean().optional(),
    order: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    initial?: Partial<IProject>;
    onSuccess: () => void;
    apiPath: string;
    editId?: string;
}

export default function ProjectForm({ initial, onSuccess, apiPath, editId }: Props) {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
    const [screenshots, setScreenshots] = useState<string[]>(initial?.screenshots ?? []);
    const [newScreenshot, setNewScreenshot] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: initial?.title ?? "",
            description: initial?.description ?? "",
            longDescription: initial?.longDescription ?? "",
            techStack: initial?.techStack?.join(", ") ?? "",
            githubUrl: initial?.githubUrl ?? "",
            liveUrl: initial?.liveUrl ?? "",
            otherLinks: initial?.otherLinks ? JSON.stringify(initial.otherLinks) : "",
            featured: initial?.featured ?? false,
            order: String(initial?.order ?? 0),
        },
    });

    const addScreenshot = (url: string) => {
        if (url) setScreenshots((prev) => [...prev, url]);
        setNewScreenshot("");
    };

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        let parsedOtherLinks = [];
        try { parsedOtherLinks = data.otherLinks ? JSON.parse(data.otherLinks) : []; } catch { parsedOtherLinks = []; }
        const payload = {
            ...data,
            techStack: data.techStack.split(",").map((s) => s.trim()).filter(Boolean),
            featured: data.featured ?? false,
            order: Number(data.order) || 0,
            imageUrl,
            screenshots,
            otherLinks: parsedOtherLinks,
        };
        try {
            const res = await fetch(editId ? `${apiPath}/${editId}` : apiPath, {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) { toast.success(editId ? "Updated!" : "Created!"); onSuccess(); }
            else toast.error("Failed to save.");
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div>
                <Label className="text-foreground/80 mb-1 block">Title *</Label>
                <Input {...register("title")} className="bg-foreground/5 border-border/60 text-foreground" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Short Description *</Label>
                <Textarea {...register("description")} rows={2} className="bg-foreground/5 border-border/60 text-foreground resize-none" />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Long Description (detail page)</Label>
                <Textarea {...register("longDescription")} rows={4} className="bg-foreground/5 border-border/60 text-foreground resize-none" placeholder="Full project description shown on the detail page..." />
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Tech Stack (comma-separated)</Label>
                <Input {...register("techStack")} placeholder="React, Node.js, MongoDB" className="bg-foreground/5 border-border/60 text-foreground" />
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">GitHub URL</Label>
                <Input {...register("githubUrl")} className="bg-foreground/5 border-border/60 text-foreground" />
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Live URL</Label>
                <Input {...register("liveUrl")} className="bg-foreground/5 border-border/60 text-foreground" />
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Other Links (JSON array)</Label>
                <Input {...register("otherLinks")} placeholder='[{"label":"Demo","url":"https://..."}]' className="bg-foreground/5 border-border/60 text-foreground text-xs" />
            </div>
            <ImageUpload label="Cover Image" value={imageUrl} onChange={setImageUrl} />

            {/* Screenshots */}
            <div>
                <Label className="text-foreground/80 mb-2 block">Screenshots ({screenshots.length}/5)</Label>
                <div className="space-y-2">
                    {screenshots.map((src, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground truncate flex-1">{src}</span>
                            <button type="button" onClick={() => setScreenshots((p) => p.filter((_, j) => j !== i))}
                                className="text-xs text-red-400 hover:text-red-300 shrink-0">✕</button>
                        </div>
                    ))}
                    {screenshots.length < 5 && (
                        <ImageUpload
                            label="Add Screenshot"
                            value={newScreenshot}
                            onChange={(url) => { if (url) { addScreenshot(url); } else setNewScreenshot(""); }}
                        />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" {...register("featured")} id="featured" className="accent-violet-500" />
                <Label htmlFor="featured" className="text-foreground/80 text-sm">Featured project</Label>
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Order</Label>
                <Input {...register("order")} type="number" className="bg-foreground/5 border-border/60 text-foreground w-24" />
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white dark:text-white">
                    {loading ? "Saving…" : editId ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
