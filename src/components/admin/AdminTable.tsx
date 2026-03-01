"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: unknown, row: T) => React.ReactNode;
}

interface AdminTableProps<T extends { _id: string }> {
    title: string;
    apiPath: string;
    columns: Column<T>[];
    FormComponent: React.ComponentType<{
        initial?: Partial<T>;
        onSuccess: () => void;
        apiPath: string;
        editId?: string;
    }>;
    emptyMessage?: string;
}

export default function AdminTable<T extends { _id: string }>({
    title,
    apiPath,
    columns,
    FormComponent,
    emptyMessage = "No items yet.",
}: AdminTableProps<T>) {
    const { data, isLoading } = useSWR<T[]>(apiPath, fetcher);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<T | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this item?")) return;
        const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Deleted.");
            mutate(apiPath);
        } else {
            toast.error("Delete failed.");
        }
    };

    const openAdd = () => {
        setEditing(null);
        setOpen(true);
    };

    const openEdit = (item: T) => {
        setEditing(item);
        setOpen(true);
    };

    const handleSuccess = () => {
        setOpen(false);
        mutate(apiPath);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                <Button
                    onClick={openAdd}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                    <Plus size={15} className="mr-1" /> Add
                </Button>
            </div>

            <div className="glass-card overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500 animate-pulse">Loading…</div>
                ) : !data || data.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">{emptyMessage}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    {columns.map((col) => (
                                        <th
                                            key={String(col.key)}
                                            className="px-5 py-3.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="px-5 py-3.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.map((row) => (
                                    <tr key={row._id} className="hover:bg-white/3 transition-colors">
                                        {columns.map((col) => (
                                            <td key={String(col.key)} className="px-5 py-4 text-slate-300">
                                                {col.render
                                                    ? col.render(row[col.key], row)
                                                    : String(row[col.key] ?? "")}
                                            </td>
                                        ))}
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(row)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row._id)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-[#0d0d1a] border-white/10 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="gradient-text">
                            {editing ? "Edit" : "Add"} {title.replace(/s$/, "")}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {editing ? "Edit" : "Add a new"} {title.replace(/s$/, "").toLowerCase()}
                        </DialogDescription>
                    </DialogHeader>
                    <FormComponent
                        initial={editing ?? undefined}
                        onSuccess={handleSuccess}
                        apiPath={apiPath}
                        editId={editing?._id}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
