# aerospace
Aerospace Rocket Launch Project for AeroSTEM 2025 Youth Expo using matter.js and next.js


![image](https://github.com/user-attachments/assets/22388283-7871-4495-a078-83d7ffe52c1b)


__Project Milestones__

- ✔️ Create environment with next.js
- ✔️ Use matter.js as a physics engine to simulate a rocket launch
- ✔️ Add special effects to the UI upon completion
- Flesh out drag and lift so that the shape and air resistance is calculated within the launch.

## Create environment with next.js

With next.js I was able to setup this entire project relatively smoothly. After installation, I started a blank project and made a useState and useRef as react hooks for the rocket being launched and the canvas.

```bash
    const sceneRef = useRef<HTMLDivElement>(null);
    const [launched, setLaunched] = useState(false);
```

After this I setup the rest of our useStates for different variables relative to the rocket:

```bash
  const [rocketColor, setRocketColor] = useState("#ff0000");
  const [thrust, setThrust] = useState(0.05); // Default thrust strength
  const [showFlame, setShowFlame] = useState(false); //use of fire
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 0 }); //use of rocket location
  const [mass, setMass] = useState(5); // default in kilograms
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reachedSpace, setReachedSpace] = useState(false);
  const isThrusting = useRef(false);
```

## Use matter.js as a physics engine to simulate a rocket launch

After installing matter.js, you can manipulate images within your useEffect by create a world and running the engine and render.

```bash
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
  
```

After creating entities for the rocket, ground and ceiling, I had to implement logic for the rocket to thrust and have the effects of gravity on it. Trying to implement drag was a challenge, so we scrapped it for the expo!

```bash
const handleLaunch = () => {
    if (launched || countdown !== null) return;
  
    let seconds = 5;
    setCountdown(seconds);
  
    const interval = setInterval(() => {
      seconds -= 1;
      if (seconds > 0) {
        setCountdown(seconds);
      } else {
        clearInterval(interval);
        setCountdown(null);
        const rocket = (window as any).rocket;
        setLaunched(true);
        setShowFlame(true);
        isThrusting.current = true;
  
        setTimeout(() => {
          setShowFlame(false);
          isThrusting.current = false; // stop thrusting after 1 second
        }, 1000);
      }
    }, 1000);
  };

 ```

## Add special effects to the UI upon completion

With some simple tailwind, I was able to make the screen change colors upon reaching outer space(the ceiling!)

![areospace](https://github.com/user-attachments/assets/8dc7a4ef-2958-4021-8437-ae83d92d9251)

### This Project was presented at the AreoSTEM 2025 Expo, and by having students change values for the gravity, thrust, and mass of rocket they were able to simulate a rocket launch and get exposure to coding!


