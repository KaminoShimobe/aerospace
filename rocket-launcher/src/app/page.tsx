'use client';
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { collectRoutesUsingEdgeRuntime } from "next/dist/build/utils";




export default function Home() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [launched, setLaunched] = useState(false);
  const [rocketColor, setRocketColor] = useState("#ff0000");
  const [thrust, setThrust] = useState(0.05); // Default thrust strength

//  function setRocketColor(color: string): string{
//     return color;
//   }
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

  const createRocket = async (x: number, y: number, hexColor: string) => {
    const tintedTexture = await tintImage("/rocket.png", hexColor);
  
    return Matter.Bodies.rectangle(x, y, 40, 80, {
      label: "rocket",
      render: {
        sprite: {
          texture: tintedTexture,
          xScale: 0.2,
          yScale: 0.2,
        },
      },
    });
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

      const rocket = await createRocket(400, 500, rocketColor);
    // const rocket = Matter.Bodies.rectangle(400, 500, 40, 80, {
    //   label: 'rocket',
    //   render: {
    //     sprite: {
    //       texture: "/rocket.png",
    //       xScale: .2,
    //       yScale: .2
    //     },
    //     fillStyle: '#ff4c4c'
    //   }
    // });

    const ground = Matter.Bodies.rectangle(400, 590, 810, 20, {
      isStatic: true,
      render: {
        fillStyle: '#888',
      },
    });

    Matter.World.add(engine.world, [rocket, ground]);
    Matter.Runner.run(engine);
    Matter.Render.run(render);

    // Save rocket reference to window for interaction
    (window as any).rocket = rocket;
    (window as any).ground = ground;
    (window as any).engine = engine;

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

  const handleLaunch = () => {
    const rocket = (window as any).rocket;
    const ground = (window as any).ground;
    const engine = (window as any).engine;
    if (!launched) {
      Matter.Body.applyForce(rocket, rocket.position, {
        x: 0,
        y: -thrust
      });
      setLaunched(true);
      if(Matter.Collision.collides(rocket, ground) != null){
        setLaunched(false);
      }
    }

    
  };

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">🚀 Code Your Rocket: Simulate a Real Launch!</h1>
      <p className="mb-4 text-center max-w-xl">
        Click the button below to launch the rocket! This demo helps you learn about the four forces of flight: thrust, drag, lift, and gravity.
      </p>
      <button
        onClick={handleLaunch}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Launch Rocket
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
            max="0.2"
            step="0.01"
            value={thrust}
            onChange={(e) => setThrust(parseFloat(e.target.value))}
            className="mb-4 w-64"
          />
          <span className="text-sm text-gray-600 mb-4">
            {thrust.toFixed(2)} N
          </span>
      <div ref={sceneRef} className="border border-gray-400 rounded" />
    </div>
  );
}
