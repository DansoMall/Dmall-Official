interface Props { label?: string; }

export default function VendorBadge({ label = 'Official Store' }: Props) {
  return (
    <span className="text-[11px] font-semibold text-primary border border-primary rounded-md px-2 py-0.5 inline-block">
      {label}
    </span>
  );
}
