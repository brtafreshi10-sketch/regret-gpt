"use client";

export default function TextInput({
  value,
  setValue,
}: {
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <textarea
      className="w-full h-32 p-4 rounded-xl bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-blue-500 transition"
      placeholder="Describe your decision..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
