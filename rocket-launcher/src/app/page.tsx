'use client';
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { collectRoutesUsingEdgeRuntime } from "next/dist/build/utils";

// function calculateDragForce({
//   velocity,
//   airDensity = 0.225,     // kg/m³
//   dragCoefficient = 0.75, // rocket shape
//   area = 0.03             // m² (adjust to match rocket width)
// }: {
//   velocity: number;
//   airDensity?: number;
//   dragCoefficient?: number;
//   area?: number;
// }) {
//   return 0.5 * airDensity * velocity ** 2 * dragCoefficient * area;
// }


export default function Home() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [launched, setLaunched] = useState(false);
  const [rocketColor, setRocketColor] = useState("#ff0000");
  const [thrust, setThrust] = useState(0.05); // Default thrust strength
  const [showFlame, setShowFlame] = useState(false); //use of fire
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 0 }); //use of rocket location
  const [mass, setMass] = useState(5); // default in kilograms
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reachedSpace, setReachedSpace] = useState(false);


  //tint image
  const tintImage = async (imagePath: string, hexColor: string): Promise<string> => {
    const img = document.createElement("img"); 
    img.src = imagePath;
  
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });
  
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
  
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
  
    // Set global composite to source-in to tint image
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    return canvas.toDataURL("/png");
  };

  const createRocket = async (x: number, y: number, hexColor: string, mass: number) => {
  const tintedTexture = await tintImage("/rocket.png", hexColor);
  
    const rocket = Matter.Bodies.rectangle(x, y, 40, 80, {
      label: "rocket",
      render: {
        sprite: {
          texture: tintedTexture,
          xScale: 0.2,
          yScale: 0.2,
        },
      },
    });
    Matter.Body.setMass(rocket, mass);

    return rocket;
  };
  

  

  let engine: Matter.Engine;
  let render: Matter.Render;

  useEffect(() => {
    const setup = async () => {
      engine = Matter.Engine.create();
      render = Matter.Render.create({
        element: sceneRef.current!,
        engine,
        options: {
          width: 800,
          height: 600,
          wireframes: false,
        },
      });

      const rocket = await createRocket(400, 500, rocketColor, mass);
   

    const ground = Matter.Bodies.rectangle(400, 590, 810, 20, {
      isStatic: true,
      render: {
        fillStyle: '#888',
      },
    });

    const ceiling = Matter.Bodies.rectangle(400, 0, 800, 20, {
      label: "ceiling",
      isStatic: true,
      render: { visible: false } // or show if you want
    });

    Matter.World.add(engine.world, [rocket, ground, ceiling]);
    Matter.Runner.run(engine);
    Matter.Render.run(render);

    // Save rocket reference to window for interaction
    (window as any).rocket = rocket;
    (window as any).ground = ground;
    (window as any).engine = engine;

    Matter.Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes("rocket") && labels.includes("ceiling")) {
          setReachedSpace(true);
    
          //Optional: stop movement
          const rocket = (window as any).rocket;
          Matter.Body.setVelocity(rocket, { x: 0, y: 0 });
    
          // Optional: change background to "space"
          document.body.style.background = "linear-gradient(#000011, #000000)";
        }
      });
    });

      Matter.Events.on(engine, "afterUpdate", () => {
        const rocket = (window as any).rocket;
        
      
        if (rocket) {
          // Get vertical velocity (we only care about y for now)
          // const velocityY = rocket.velocity.y;
      
          // // Calculate drag force (same direction as velocity, opposes motion)
          // const drag = calculateDragForce({ velocity: Math.abs(velocityY) });
      
          // const dragForce = {
          //   x: 0,
          //   y: -Math.sign(velocityY) * drag, // Oppose vertical motion
          // };
      
          // Matter.Body.applyForce(rocket, rocket.position, dragForce);
      
          // Update position state if needed for visuals
          setRocketPosition({ x: rocket.position.x, y: rocket.position.y });
          
          // console.log("Drag force:", drag.toFixed(4), "N");
        }
      });
    

  };

  setup();
    
  return () => {
    
    if (render && engine) {
      Matter.Render.stop(render);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    }
  };
  }, [rocketColor]);

  const resetSimulation = () => {
    setReachedSpace(false);
    // reset rocket position, etc.
  };

  const handleLaunch = () => {
    if (launched || countdown !== null) return; // prevent double clicking

    let seconds = 5;
    setCountdown(seconds);


    const rocket = (window as any).rocket;
    const ground = (window as any).ground;
    const engine = (window as any).engine;


    const interval = setInterval(() => {
      seconds -= 1;
      if (seconds > 0) {
        setCountdown(seconds);
      } else {
        clearInterval(interval);
        setCountdown(null); // hide countdown
        const rocket = (window as any).rocket;
    setShowFlame(true);

    // Turn it off after ~500ms (fake burn duration)
    setTimeout(() => setShowFlame(false), 500);
    if (!launched) {
      Matter.Body.applyForce(rocket, rocket.position, {
        x: 0,
        y: -thrust / mass
      });
      setLaunched(true);
      if(Matter.Collision.collides(rocket, ground) != null){
        setLaunched(false);
        
      }
    }

  }
}, 1000);

    
  };

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">🚀 Code Your Rocket: Simulate a Real Launch!</h1>
      <p className="mb-4 text-center max-w-xl">
        Click the button below to launch the rocket! This demo helps you learn about the four forces of flight: thrust, drag, lift, and gravity.
      </p>
      <div className="grid grid-flow-col grid-rows-3 gap-4">
      <button
        onClick={handleLaunch}
        className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Launch Rocket
      </button>
      <button
        onClick={resetSimulation}
        className="col-span-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Reset Simulation
      </button>
          <label className="mb-2 text-sm font-medium text-gray-700">
            Pick your rocket color:
          </label>
          <input
            type="color"
            value={rocketColor}
            onChange={(e) => setRocketColor(e.target.value)}
            className="mb-4 w-16 h-10 p-1 border border-gray-300 rounded"
          />
          <label className="mb-2 text-sm font-medium text-gray-700">
            Adjust Thrust:
          </label>
          <input
            type="range"
            min="0.01"
            max="1.00"
            step="0.01"
            value={thrust}
            onChange={(e) => setThrust(parseFloat(e.target.value))}
            className="mb-4 w-64"
          />
          <span className="text-sm text-gray-600 mb-4">
            {thrust.toFixed(2)} N
          </span>
          <label className="mb-2 text-sm font-medium text-gray-700">
            Adjust Rocket Mass (kg):
          </label>
          <input
            type="number"
            value={mass}
            onChange={(e) => setMass(parseFloat(e.target.value))}
            className="mb-2 w-64"
          />
<span className="text-sm text-gray-600 mb-4 block">{mass} kg</span>
{countdown !== null && (
  <div className="text-6xl font-bold text-red-600 mb-4 animate-pulse">
    T-{countdown}
  </div>
)}

      </div>
{reachedSpace && (
  <div className="top-10 text-center left-0 right-0 z-50 text-3xl text-yellow-300 font-bold animate-bounce">
    🛰️ You Reached Space!
  </div>
)}
      <div ref={sceneRef} className="border border-gray-400 rounded" />
          {showFlame && (
      <img
        src="flame.png"
        alt="flame"
        style={{
          position: "absolute",
          left: rocketPosition.x + 535,
          top: rocketPosition.y + 500,
          width: 30,
          height: 50,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
    )}
    </div>
  );
}
