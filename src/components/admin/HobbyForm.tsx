"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { IHobby } from "@/types";

const schema = z.object({
    name: z.string().min(1, "Required"),
    order: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    initial?: Partial<IHobby>;
    onSuccess: () => void;
    apiPath: string;
    editId?: string;
}

export default function HobbyForm({ initial, onSuccess, apiPath, editId }: Props) {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initial?.name ?? "",
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
                <Label className="text-slate-300 mb-1 block">Hobby *</Label>
                <Input {...register("name")} placeholder="e.g. Photography" className="bg-white/5 border-white/10 text-white" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <Label className="text-slate-300 mb-1 block">Order</Label>
                <Input {...register("order", { valueAsNumber: true })} type="number" placeholder="0" className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                {loading ? "Saving…" : editId ? "Update" : "Create"}
            </Button>
        </form>
    );
}
