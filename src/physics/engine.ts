import Matter from 'matter-js';

const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

let engineInstance: Matter.Engine | null = null;
let renderInstance: Matter.Render | null = null;
let runnerInstance: Matter.Runner | null = null;

export const initPhysics = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const engine = Engine.create({
    gravity: { x: 0, y: 1 },
  });

  const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: 'transparent',
      showAngleIndicator: false,
      pixelRatio: window.devicePixelRatio,
    },
  });

  const runner = Runner.create();

  engineInstance = engine;
  renderInstance = render;
  runnerInstance = runner;

  Render.run(render);
  Runner.run(runner, engine);

  const ground = Bodies.rectangle(width / 2, height - 20, width, 40, {
    isStatic: true,
    render: { fillStyle: '#2a2a3e' },
    label: 'ground',
  });

  const leftWall = Bodies.rectangle(20, height / 2, 40, height, {
    isStatic: true,
    render: { fillStyle: '#2a2a3e' },
    label: 'wall',
  });

  const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, {
    isStatic: true,
    render: { fillStyle: '#2a2a3e' },
    label: 'wall',
  });

  const ceiling = Bodies.rectangle(width / 2, 20, width, 40, {
    isStatic: true,
    render: { fillStyle: '#2a2a3e' },
    label: 'ceiling',
  });

  Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

  return { engine, render, runner };
};

export const getEngine = () => engineInstance;
export const getRender = () => renderInstance;
export const getRunner = () => runnerInstance;

export const cleanupPhysics = () => {
  if (renderInstance) {
    Render.stop(renderInstance);
  }
  if (runnerInstance) {
    Runner.stop(runnerInstance);
  }
  if (engineInstance) {
    Engine.clear(engineInstance);
  }
  engineInstance = null;
  renderInstance = null;
  runnerInstance = null;
};

export const setGravity = (x: number, y: number) => {
  if (engineInstance) {
    engineInstance.gravity.x = x;
    engineInstance.gravity.y = y;
  }
};

export const setTimeScale = (scale: number) => {
  if (engineInstance) {
    engineInstance.timing.timeScale = scale;
  }
};

export const togglePause = (paused: boolean) => {
  if (runnerInstance) {
    runnerInstance.enabled = !paused;
  }
};

export const stepEngine = () => {
  if (engineInstance) {
    Engine.update(engineInstance, 1000 / 60);
  }
};

export const addBody = (body: Matter.Body) => {
  if (engineInstance) {
    Composite.add(engineInstance.world, body);
  }
};

export const removeBody = (body: Matter.Body) => {
  if (engineInstance) {
    Composite.remove(engineInstance.world, body);
  }
};

export const addConstraint = (constraint: Matter.Constraint) => {
  if (engineInstance) {
    Composite.add(engineInstance.world, constraint);
  }
};

export const removeConstraint = (constraint: Matter.Constraint) => {
  if (engineInstance) {
    Composite.remove(engineInstance.world, constraint);
  }
};

export const clearWorld = () => {
  if (engineInstance) {
    Composite.clear(engineInstance.world, false, true);
  }
};

export const onCollision = (callback: (pairs: Matter.Pair[]) => void) => {
  if (engineInstance) {
    Events.on(engineInstance, 'collisionStart', (event) => {
      callback(event.pairs);
    });
  }
};
