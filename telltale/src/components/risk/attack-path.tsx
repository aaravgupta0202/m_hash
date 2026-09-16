"use client";

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SENSITIVITY_COLOR } from "@/components/risk/chips";
import type { AttackPathEdge, AttackPathNode, Sensitivity } from "@/lib/fixtures";

/**
 * PRD §5.3E: left-to-right node graph of the trajectory, React Flow, fixed
 * hand-positioned layout, non-interactive except for hover. Node coordinates
 * come from the fixture, so the graph reads the same in the video and on a
 * judge's screen — auto-layout would relayout on any viewport change.
 *
 * The anomalous edge carries its transition probability as the label. A
 * probability of 0.0004 is the claim "four times in ten thousand transitions of
 * this shape, in this organisation" — which is the sentence the graph exists to
 * make legible.
 */

interface StepData extends Record<string, unknown> {
  label: string;
  sublabel: string;
  sensitivity: Sensitivity;
}

/**
 * Fixture x-coordinates are spaced for a 176px node, which leaves 14–34px
 * between nodes — too little for an edge label like `P = 0.0007` to sit in
 * without overlapping its own nodes. Scaling the whole layout keeps the
 * hand-authored order and proportions and buys the labels room.
 */
const X_SCALE = 1.4;

function StepNode({ data }: NodeProps<Node<StepData>>) {
  const color = SENSITIVITY_COLOR[data.sensitivity];
  return (
    <div
      className="w-44 rounded-sm border bg-white px-2.5 py-2"
      style={{ borderColor: color, borderLeftWidth: 3 }}
      title={`${data.label} — ${data.sensitivity} sensitivity`}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} className="!size-1.5 !border-0 !bg-line" />
      <p className="machine truncate text-[11px] leading-tight font-medium text-ink">{data.label}</p>
      <p className="mt-1 text-[10px] leading-snug text-grey">{data.sublabel}</p>
      <Handle type="source" position={Position.Right} isConnectable={false} className="!size-1.5 !border-0 !bg-line" />
    </div>
  );
}

const nodeTypes = { step: StepNode };

export function AttackPath({
  nodes: fixtureNodes,
  edges: fixtureEdges,
}: {
  nodes: AttackPathNode[];
  edges: AttackPathEdge[];
}) {
  const nodes = useMemo<Node<StepData>[]>(
    () =>
      fixtureNodes.map((n) => ({
        id: n.id,
        type: "step",
        position: { x: n.x * X_SCALE, y: n.y },
        draggable: false,
        selectable: false,
        connectable: false,
        data: { label: n.label, sublabel: n.sublabel, sensitivity: n.sensitivity },
      })),
    [fixtureNodes],
  );

  const edges = useMemo<Edge[]>(
    () =>
      fixtureEdges.map((e) => ({
        id: `${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        type: "smoothstep",
        animated: false,
        label: e.probability === undefined ? undefined : `P = ${formatP(e.probability)}`,
        labelShowBg: true,
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 2,
        labelBgStyle: { fill: "#fff", stroke: e.anomalous ? "var(--tt-red)" : "var(--tt-line)" },
        labelStyle: {
          fill: e.anomalous ? "var(--tt-red)" : "var(--tt-grey)",
          fontSize: 10,
          fontFamily: "var(--font-jetbrains)",
          fontWeight: e.anomalous ? 600 : 400,
        },
        style: {
          stroke: e.anomalous ? "var(--tt-red)" : "var(--tt-line)",
          strokeWidth: e.anomalous ? 2 : 1.4,
        },
      })),
    [fixtureEdges],
  );

  const width = Math.max(...fixtureNodes.map((n) => n.x), 0) * X_SCALE + 220;
  const anomalous = fixtureEdges.filter((e) => e.anomalous);
  /* Node ids are internal (n0, n1) on generated rows, so the prose below names
     the actions rather than the ids. */
  const labelOf = (id: string) => fixtureNodes.find((n) => n.id === id)?.label ?? id;

  return (
    <div>
      <div className="h-60 w-full border-b border-line">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.14, maxZoom: 1 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          translateExtent={[
            [-60, -60],
            [width, 220],
          ]}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="var(--tt-line)" />
        </ReactFlow>
      </div>

      <div className="px-4 py-2.5">
        {anomalous.length === 0 ? (
          <p className="text-xs leading-relaxed text-grey">
            No transition in this path falls below the surprisal threshold. The path is unusual in its
            resources, not in its shape.
          </p>
        ) : (
          <ul className="space-y-1">
            {anomalous.map((e) => (
              <li key={`${e.from}-${e.to}`} className="text-xs leading-relaxed text-grey">
                <span className="machine text-red">
                  P({labelOf(e.to)} | {labelOf(e.from)}) = {formatP(e.probability ?? 0)}
                </span>{" "}
                — {describe(e.probability ?? 0)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatP(p: number) {
  if (p >= 0.01) return p.toFixed(2);
  if (p >= 0.001) return p.toFixed(3);
  return p.toFixed(4);
}

/** The "one in N" reading of a transition probability, stated in words. */
function describe(p: number) {
  if (p <= 0) return "never observed in this organisation";
  const n = Math.round(1 / p);
  return `roughly one in ${n.toLocaleString("en-US")} transitions of this shape in this organisation`;
}
