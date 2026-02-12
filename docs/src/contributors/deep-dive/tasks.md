# Tasks

Tasks are CLI commands users run with `npx hardhat <task>`.

---

## Defining a Task

```typescript
task(['arb:node', 'start'], 'Start the local Arbitrum node')
  .addFlag({
    name: 'detach',
    shortName: 'd',
    description: 'Run in background',
  })
  .addOption({
    name: 'httpPort',
    type: ArgumentType.INT,
    defaultValue: 0,
    description: 'Custom HTTP port',
  })
  .setAction(() => import('./tasks/start.js'))
  .build();
```

The array `['arb:node', 'start']` creates a subtask. In Hardhat 3, subtasks are the way to organize related commands under a parent.

---

## Task Action

Each task file exports an action function:

```typescript
// tasks/start.ts
const startTask: NewTaskActionFunction<StartTaskArguments> = async (
  args,
  hre,
) => {
  const { detach, httpPort } = args;
  // Implementation...
};

export default startTask;
```

---

## Our Subtasks

```
arb:node start   - Start the node
arb:node stop    - Stop the node
arb:node status  - Check status
arb:node logs    - View logs
```

---

## Calling Tasks Programmatically

Tasks can call other tasks:

```typescript
await hre.tasks.getTask(['arb:node', 'start']).run({
  detach: true,
  quiet: true,
});
```
