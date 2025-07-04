import dagre from 'dagre';
import type { Node, Edge } from 'reactflow'; // ✅ FIXED: imported as type
import { Position } from 'reactflow';

const nodeWidth = 172;
const nodeHeight = 36;

export function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
}

export function validateDAG(nodes: Node[], edges: Edge[]) {
  if (nodes.length < 2) return false;
  if (nodes.some((node) => !edges.some((e) => e.source === node.id || e.target === node.id))) return false;

  const visited = new Set<string>();
  const recStack = new Set<string>();

  const graph: Record<string, string[]> = {};
  edges.forEach((edge) => {
    if (!graph[edge.source]) graph[edge.source] = [];
    graph[edge.source].push(edge.target);
  });

  const hasCycle = (nodeId: string): boolean => {
    if (!visited.has(nodeId)) {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = graph[nodeId] || [];
      for (let neighbor of neighbors) {
        if (!visited.has(neighbor) && hasCycle(neighbor)) return true;
        else if (recStack.has(neighbor)) return true;
      }
    }
    recStack.delete(nodeId);
    return false;
  };

  return !nodes.some((node) => hasCycle(node.id));
}
