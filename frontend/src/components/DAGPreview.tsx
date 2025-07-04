import React from 'react';
import type { Node, Edge } from 'reactflow';

type Props = {
  nodes: Node[];
  edges: Edge[];
};

const DAGPreview: React.FC<Props> = ({ nodes, edges }) => {
  return (
    <div className="bg-gray-100 p-4 h-full overflow-auto border-l border-gray-300 text-sm">
      <h2 className="text-md font-semibold mb-2">DAG JSON Preview</h2>
      <pre className="whitespace-pre-wrap break-words bg-white p-2 rounded shadow-inner max-h-[80vh] overflow-y-scroll">
        {JSON.stringify({ nodes, edges }, null, 2)}
      </pre>
    </div>
  );
};

export default DAGPreview;
