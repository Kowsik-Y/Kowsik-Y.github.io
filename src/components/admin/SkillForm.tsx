"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SkillIcon from "@/components/ui/skill-icon";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ISkill } from "@/types";

const schema = z.object({
    name: z.string().min(1, "Required"),
    category: z.enum(["Tech", "Tool", "Soft"]),
    icon: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    initial?: Partial<ISkill>;
    onSuccess: () => void;
    apiPath: string;
    editId?: string;
}

export default function SkillForm({ initial, onSuccess, apiPath, editId }: Props) {
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<"Tech" | "Tool" | "Soft">(
        initial?.category ?? "Tech"
    );
    const [iconPreview, setIconPreview] = useState(initial?.icon ?? "");

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initial?.name ?? "",
            category: initial?.category ?? "Tech",
            icon: initial?.icon ?? "",
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
                <Label className="text-foreground/80 mb-1 block">Skill Name *</Label>
                <Input {...register("name")} className="bg-foreground/5 border-border/60 text-foreground" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Category *</Label>
                <Select
                    defaultValue={category}
                    onValueChange={(val) => {
                        setCategory(val as "Tech" | "Tool" | "Soft");
                        setValue("category", val as "Tech" | "Tool" | "Soft");
                    }}
                >
                    <SelectTrigger className="bg-foreground/5 border-border/60 text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ui-surface border-border/60 text-foreground">
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Tool">Tool</SelectItem>
                        <SelectItem value="Soft">Soft</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-foreground/80 mb-1 block">Icon Slug (simpleicons.org)</Label>
                <div className="flex items-center gap-2">
                    <Input
                        {...register("icon")}
                        placeholder="e.g. python, react, typescript"
                        className="bg-foreground/5 border-border/60 text-foreground"
                        onChange={(e) => {
                            register("icon").onChange(e);
                            setIconPreview(e.target.value.trim().toLowerCase());
                        }}
                    />
                    {iconPreview && (
                        <div className="p-2 rounded-lg bg-foreground/10 text-violet-600 dark:text-violet-300 shrink-0">
                            <SkillIcon name={iconPreview} size={20} />
                        </div>
                    )}
                </div>
                <p className="text-muted-foreground text-xs mt-1">Leave blank to auto-lookup by name.</p>
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white dark:text-white">
                    {loading ? "Saving…" : editId ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
