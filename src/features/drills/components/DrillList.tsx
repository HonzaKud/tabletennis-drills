import { Drill } from "../types/drill";
import { DrillCard } from "./DrillCard";

type Props = {
  drills: Drill[];
  /**
   * Optional click handler (future: navigate to detail).
   */
  onDrillClick?: (drillId: string) => void;
};

export function DrillList({ drills, onDrillClick }: Props) {
  if (drills.length === 0) {
    return (
      <section className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h3 className="text-base font-semibold text-gray-900">
          Nic jsme nenašli
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Zkus upravit filtry, nebo je resetovat.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {drills.map((drill) => (
          <DrillCard
            key={drill.id}
            drill={drill}
            onClick={onDrillClick ? () => onDrillClick(drill.id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
