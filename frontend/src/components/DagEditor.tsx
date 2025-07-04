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
import type { Node, Edge, Connection } from 'reactflow';
import { Trash2, RotateCcw } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

import { getLayoutedElements, validateDAG } from '../utils/graphUtils';
import DAGPreview from './DAGPreview';

import 'reactflow/dist/style.css';
import 'react-tooltip/dist/react-tooltip.css';

let id = 0;
const getId = () => `node_${id++}`;

const DagEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [dagValid, setDagValid] = useState<boolean>(true);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const addNode = () => {
    const label = prompt('Enter node label');
    if (!label) return;

    setHistory((prev) => [...prev, { nodes, edges }]);

    const color = label.toLowerCase().includes('input')
      ? '#3b82f6'
      : label.toLowerCase().includes('output')
      ? '#10b981'
      : '#f59e0b';

    const newNode: Node = {
      id: getId(),
      data: { label },
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        padding: 10,
        border: `2px solid ${color}`,
        borderRadius: 8,
        background: '#fff',
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const { source, target, sourceHandle, targetHandle } = params;
      if (!source || !target || source === target) return;

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return;

      if (
        sourceNode.sourcePosition !== Position.Right ||
        targetNode.targetPosition !== Position.Left
      ) {
        alert('Invalid edge: must go from RIGHT to LEFT');
        return;
      }

      setHistory((prev) => [...prev, { nodes, edges }]);

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
        style: { stroke: '#222' },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, edges]
  );

  const onLayout = () => {
    setHistory((prev) => [...prev, { nodes, edges }]);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      [...nodes],
      [...edges]
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setNodes(last.nodes);
      setEdges(last.edges);
      return prev.slice(0, -1);
    });
  };

  const handleDeleteSelected = () => {
    setHistory((prev) => [...prev, { nodes, edges }]);
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  };

  const onDeleteKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        handleDeleteSelected();
      }
    },
    [handleDeleteSelected]
  );

  useEffect(() => {
    setDagValid(validateDAG(nodes, edges));
  }, [nodes, edges]);

  useEffect(() => {
    window.addEventListener('keydown', onDeleteKey);
    return () => window.removeEventListener('keydown', onDeleteKey);
  }, [onDeleteKey]);

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="p-2 flex justify-between items-center bg-gray-100 shadow">
        <div className="flex gap-2 items-center">
          <button
            data-tooltip-id="add-node"
            onClick={addNode}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ➕
          </button>
          <Tooltip id="add-node" content="Add Node" />

          <button
            data-tooltip-id="layout"
            onClick={onLayout}
            className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🧭
          </button>
          <Tooltip id="layout" content="Auto Layout" />

          <button
            data-tooltip-id="delete"
            onClick={handleDeleteSelected}
            className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 size={18} />
          </button>
          <Tooltip id="delete" content="Delete Selected" />

          <button
            data-tooltip-id="undo"
            onClick={handleUndo}
            className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            <RotateCcw size={18} />
          </button>
          <Tooltip id="undo" content="Undo" />
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
