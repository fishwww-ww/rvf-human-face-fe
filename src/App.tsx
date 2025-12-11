import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Tailwind 3.4.x 样式测试 */}
      <h1 className="text-4xl font-bold text-primary mb-6">
        Vite 5.4.8 + Tailwind 3.4.17
      </h1>
      <button
        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        onClick={() => setCount(count + 1)}
      >
        计数：{count}
      </button>
    </div>
  );
}

export default App;
