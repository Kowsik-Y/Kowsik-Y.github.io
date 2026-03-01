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
import type { IAchievement } from "@/types";

const schema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    org: z.string().optional(),
    date: z.string().optional(),
    link: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    initial?: Partial<IAchievement>;
    onSuccess: () => void;
    apiPath: string;
    editId?: string;
}

export default function AchievementForm({ initial, onSuccess, apiPath, editId }: Props) {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: initial?.title ?? "",
            description: initial?.description ?? "",
            org: initial?.org ?? "",
            date: initial?.date ?? "",
            link: initial?.link ?? "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            const res = await fetch(editId ? `${apiPath}/${editId}` : apiPath, {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, imageUrl }),
            });
            if (res.ok) { toast.success(editId ? "Updated!" : "Created!"); onSuccess(); }
            else toast.error("Failed to save.");
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label className="text-slate-300 mb-1 block">Title *</Label>
                <Input {...register("title")} className="bg-white/5 border-white/10 text-white" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
                <Label className="text-slate-300 mb-1 block">Description *</Label>
                <Textarea {...register("description")} rows={3} className="bg-white/5 border-white/10 text-white resize-none" />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
                <Label className="text-slate-300 mb-1 block">Organization</Label>
                <Input {...register("org")} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
                <Label className="text-slate-300 mb-1 block">Date</Label>
                <Input {...register("date")} placeholder="e.g. March 2025" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
                <Label className="text-slate-300 mb-1 block">Achievement Link</Label>
                <Input {...register("link")} placeholder="https://..." className="bg-white/5 border-white/10 text-white" />
            </div>
            <ImageUpload label="Achievement Image" value={imageUrl} onChange={setImageUrl} />
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white">
                    {loading ? "Saving…" : editId ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
