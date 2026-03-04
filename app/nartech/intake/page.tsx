import SubsystemDisplayPage from "@/app/components/SubsystemDisplayPage";

export default function IntakeDisplayPage() {
  const technicalSpecs = [
    {
      label: 'Motor Type',
      value: 'NEO Brushless',
    },
    {
      label: 'Gear Ratio',
      value: '100:1',
    },
    {
      label: 'Max Speed',
      value: '180 RPM',
    },
    {
      label: 'Weight',
      value: '3.2 kg',
    },
    {
      label: 'Material',
      value: 'Aluminum 6061-T6',
      // Optional image example:
      // image: '/images/material-sample.jpg'
    },
    {
      label: 'Encoder Resolution',
      value: '2048 CPR',
    },
  ];

  const controls = [
    {
      name: 'Position Control',
      description:
        'Uses PID control with feedforward for precise positioning. Target position is set via CAN bus commands from the RoboRIO.',
    },
    {
      name: 'Velocity Control',
      description:
        'Implements velocity feedforward with PID correction. Achieves stable operation within ±2 RPM of setpoint.',
      // Optional image example:
      // image: '/images/velocity-graph.jpg'
    },
    {
      name: 'Current Limiting',
      description:
        'Smart current limiting prevents motor damage and breaker trips. Limits peak current to 40A with configurable thresholds.',
    },
    {
      name: 'Safety Features',
      description:
        'Includes soft limits, hard stops, and automatic disable on encoder disconnect. Watchdog timer prevents runaway conditions.',
    },
  ];

  return (
    <SubsystemDisplayPage
      subsystemName="Arm Subsystem"
      modelConfig={{
        color: '#1976d2', // Blue color for the model
        rotationSpeed: 0.005,
      }}
      technicalSpecs={technicalSpecs}
      controls={controls}
    />
  );
}