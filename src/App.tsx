import "./App.css";
import {Button} from "@/components/ui/button"
const App = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rust-classic text-white">
      {/* If Tailwind is working, this will be a large, blue, bold heading */}
      <h1 className="text-6xl font-black text-white/60 drop-shadow-sm mb-4">
        Hello World
      </h1>

      {/* If Tailwind is working, this will have a rounded slate border */}
      <Button variant="default" className="p-5 text-xl bg-rust-blue hover:bg-rust-dark">Click me</Button>

    </div>
  );
};

export default App;
