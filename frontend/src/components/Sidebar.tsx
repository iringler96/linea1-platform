type Props = {
  currentView: string;
  onChangeView: (view: string) => void;
};

export default function Sidebar({ currentView, onChangeView }: Props) {
  const items = [
    { key: "home", label: "Inicio" },
    { key: "users", label: "Usuarios" },
    { key: "companies", label: "Empresas" },
    { key: "machines", label: "Máquinas" },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Línea 1</h2>
      <nav>
        {items.map((item) => (
          <button
            key={item.key}
            className={currentView === item.key ? "nav-btn active" : "nav-btn"}
            onClick={() => onChangeView(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}