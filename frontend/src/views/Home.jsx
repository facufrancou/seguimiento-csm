export default function Home() {
  return (
    <div
      className="container-fluid mt-4 px-2 w-100 d-flex flex-column align-items-center"
      style={{
        backgroundColor: "#f8f9fa",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <h3 style={{ fontWeight: "bold", color: "#343a40", textAlign: "center" }}>
        Bienvenido al sistema de seguimiento de entregas
      </h3>
      <p
        className="text-muted"
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          color: "#6c757d",
          textAlign: "center",
        }}
      >
        Desde aquí podrás cargar remitos, validar entregas y generar reportes.
      </p>
    </div>
  );
}
