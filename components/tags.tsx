import { useState, ChangeEvent, KeyboardEvent } from "react";

interface TagsInputProps {
    form: { tags?: string };
    setForm: (form: { tags?: string }) => void;
    loading: boolean;
}

export default function TagsInput({ form, setForm, loading }: TagsInputProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            e.preventDefault();

            const currentTags = form.tags
                ? form.tags.split(",").map((tag) => tag.trim())
                : [];

            const newTag = inputValue.trim();
            if (!currentTags.includes(newTag)) {
                const updatedTags = [...currentTags, newTag];
                setForm({ ...form, tags: updatedTags.join(",") });
            }

            setInputValue("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        if (!form.tags) return;
        const updatedTags = form.tags
            .split(",")
            .map((t) => t.trim())
            .filter((tag) => tag !== tagToRemove);
        setForm({ ...form, tags: updatedTags.join(",") });
    };

    return (
        <div className="form-control">
            <label className="label text-black capitalize">Tags</label>

            <div className="flex flex-wrap gap-2 mb-2">
                {form.tags &&
                    form.tags
                        .split(",")
                        .map((tag, idx) => (
                            <div
                                key={idx}
                                className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"
                            >
                                <span>#{tag}</span>
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="text-red-600 hover:text-red-800 font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
            </div>

            <input
                type="text"
                name="tags"
                placeholder="Type a tag and press Enter"
                value={inputValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input input-bordered w-full bg-transparent"
                disabled={loading}
            />
        </div>
    );
}
