import RoleCard, { type Role } from "./RoleCard";

type RolesGridProps = {
  roles: Role[];
};

function RolesGrid({ roles }: RolesGridProps) {
  if (roles.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-6 text-slate-400">
        No role data generated yet.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} />
      ))}
    </div>
  );
}

export default RolesGrid;
