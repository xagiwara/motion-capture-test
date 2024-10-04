export type JSONPose_v0_1_2_Quaternion = [number, number, number, number];

export interface JSONPose_v0_1_2 {
  $schema: 'https://chocolattice.github.io/json/pose.v0.1.2.json';
  pose: {
    [bone: string]: {
      rotation: JSONPose_v0_1_2_Quaternion;
    };
  };
}
