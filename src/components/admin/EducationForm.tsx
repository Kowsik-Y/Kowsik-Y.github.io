"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { IEducation } from "@/types";

const schema = z.object({
    school: z.string().min(1, "Required"),
    degree: z.string().min(1, "Required"),
    years: z.string().min(1, "Required"),
    detail: z.string().optional(),
    location: z.string().optional(),
    mapsUrl: z.string().optional(),
    order: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    initial?: Partial<IEducation>;
    onSuccess: () => void;
    apiPath: string;
    editId?: string;
}

export default function EducationForm({ initial, onSuccess, apiPath, editId }: Props) {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            school: initial?.school ?? "",
            degree: initial?.degree ?? "",
            years: initial?.years ?? "",
            detail: initial?.detail ?? "",
            location: initial?.location ?? "",
            mapsUrl: initial?.mapsUrl ?? "",
            order: initial?.order ?? 0,
        },
    });

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            const res = await fetch(editId ? `${apiPath}/${editId}` : apiPath, {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) { toast.success(editId ? "Updated!" : "Created!"); onSuccess(); }
            else toast.error("Failed to save.");
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label className="text-foreground/80 mb-1 block">School *</Label>
                <Input {...register("school")} placeholder="University / School name" className="bg-foreground/5 border-border/60 text-foreground" />
                {errors.school && <p className="text-red-400 text-xs mt-1">{errors.school.message}</p>}
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Degree *</Label>
                <Input {...register("degree")} placeholder="e.g. B.Tech in Computer Science" className="bg-foreground/5 border-border/60 text-foreground" />
                {errors.degree && <p className="text-red-400 text-xs mt-1">{errors.degree.message}</p>}
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Years *</Label>
                <Input {...register("years")} placeholder="e.g. 2020 – 2024" className="bg-foreground/5 border-border/60 text-foreground" />
                {errors.years && <p className="text-red-400 text-xs mt-1">{errors.years.message}</p>}
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Detail</Label>
                <Input {...register("detail")} placeholder="e.g. CGPA 8.5 / Grade A" className="bg-foreground/5 border-border/60 text-foreground" />
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Location</Label>
                <Input {...register("location")} placeholder="City, Country" className="bg-foreground/5 border-border/60 text-foreground" />
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Google Maps URL</Label>
                <Input {...register("mapsUrl")} placeholder="https://maps.google.com/..." className="bg-foreground/5 border-border/60 text-foreground" />
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Order</Label>
                <Input {...register("order", { valueAsNumber: true })} type="number" placeholder="0" className="bg-foreground/5 border-border/60 text-foreground" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white dark:text-white">
                {loading ? "Saving…" : editId ? "Update" : "Create"}
            </Button>
        </form>
    );
}
