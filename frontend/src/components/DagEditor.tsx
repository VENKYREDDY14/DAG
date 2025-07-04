import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    MarkerType,
    useNodesState,
    useEdgesState,
    ConnectionLineType,
    Position,
  } from 'reactflow';
  
  import type { Connection, Edge, Node } from 'reactflow';

import { getLayoutedElements, validateDAG } from '../utils/graphUtils';
import DAGPreview from './DAGPreview';

import 'reactflow/dist/style.css';

let id = 0;
const getId = () => `node_${id++}`;

const DagEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [dagValid, setDagValid] = useState<boolean>(true);

  const addNode = () => {
    const label = prompt('Enter node label');
    if (!label) return;

    const newNode: Node = {
      id: getId(),
      data: { label },
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        padding: 10,
        border: '2px solid #555',
        borderRadius: 8,
        background: '#fff',
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const { source, target, sourceHandle, targetHandle } = params;

      // Safety check
      if (!source || !target || source === target) return;

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return;

      // Validate edge direction
      if (
        sourceNode.sourcePosition !== Position.Right ||
        targetNode.targetPosition !== Position.Left
      ) {
        alert('Invalid edge: must go from RIGHT to LEFT');
        return;
      }

      const newEdge: Edge = {
        id: `${source}-${target}`,
        source,
        target,
        sourceHandle: sourceHandle ?? undefined,
        targetHandle: targetHandle ?? undefined,
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes]
  );

  const onLayout = () => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      [...nodes],
      [...edges]
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    setDagValid(validateDAG(nodes, edges));
  }, [nodes, edges]);

  useEffect(() => {
    window.addEventListener('keydown', onDelete);
    return () => window.removeEventListener('keydown', onDelete);
  }, [onDelete]);

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="p-2 flex justify-between items-center bg-gray-100 shadow">
        <div className="flex gap-2">
          <button
            onClick={addNode}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Node
          </button>
          <button
            onClick={onLayout}
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Auto Layout
          </button>
        </div>
        <div
          className={`text-sm font-medium ${
            dagValid ? 'text-green-600' : 'text-red-600'
          }`}
        >
          DAG Status: {dagValid ? 'Valid' : 'Invalid'}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        <div className="w-[300px] border-l">
          <DAGPreview nodes={nodes} edges={edges} />
        </div>
      </div>
    </div>
  );
};

export default DagEditor;
