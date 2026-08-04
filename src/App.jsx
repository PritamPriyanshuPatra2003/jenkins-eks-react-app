import "./App.css";

function App() {
  return (
    <main className="app">
      <div className="card">
        <h1>🚀 React App - Version 2.1  </h1>

        <h2>React + Docker + Kubernetes + Jenkins + Amazon EKS</h2>
	<h2> Rolling update - Kubernetes</h2>

        <p>
          This application will be built, containerized, and deployed
          automatically using a complete CI/CD pipeline.
        </p>

        <div className="pipeline">
          GitHub → Jenkins → Docker → Amazon ECR → Amazon EKS
        </div>

        <h3>Application Version: 1.0</h3>
      </div>
    </main>
  );
}

export default App;
