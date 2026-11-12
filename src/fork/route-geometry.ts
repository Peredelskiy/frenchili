/**
 * The route as it stands: which nodes the line, the time display and the
 * parts panel show, in order. Pure, no DOM.
 *
 * The route is one line. Checkpoints are stations on it. When a learner's
 * answer sends them through extra material (a "closer look") or a short
 * confirmation, that segment is inserted into the line right after the
 * station and the line grows: the route got longer, and the map says so.
 */
import { isQuestion, isSegment, walkMainLine, type QuestionNode, type Scenario, type SegmentNode } from './scenario';

/**
 * The nodes the map draws, in line order: the main line, plus — after each
 * station — the segments a given answer led through, as far as they have been
 * visited. Unvisited branches are not drawn: the map never reveals which
 * answers are wrong.
 */
export function routeOrder(scenario: Scenario, visited: ReadonlySet<string>): (SegmentNode | QuestionNode)[] {
  const main = walkMainLine(scenario);
  const mainIds = new Set(main.filter(isSegment).map((s) => s.id));
  const order: (SegmentNode | QuestionNode)[] = [];
  for (const node of main) {
    order.push(node);
    if (!isQuestion(node)) continue;
    const taken = node.options.find((o) => visited.has(o.next) && !mainIds.has(o.next));
    if (!taken) continue;
    const seen = new Set<string>();
    let id = taken.next;
    while (id && !mainIds.has(id) && !seen.has(id)) {
      seen.add(id);
      const hop = scenario.nodes[id];
      if (!isSegment(hop) || !visited.has(hop.id)) break;
      order.push(hop);
      id = hop.kind === 'detour' && hop.returnsTo ? hop.returnsTo : hop.next;
    }
  }
  return order;
}
