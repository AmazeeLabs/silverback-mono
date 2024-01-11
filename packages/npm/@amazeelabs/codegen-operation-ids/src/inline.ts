import {
  ExecutableDefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  Kind,
  SelectionNode,
} from 'graphql';

export function inlineFragments<
  TNode extends ExecutableDefinitionNode | FieldNode,
>(node: TNode, fragments: Map<string, FragmentDefinitionNode>): TNode {
  const selections = [] as Array<SelectionNode>;
  const target = structuredClone(node);
  target.selectionSet?.selections.forEach((sel) => {
    if (sel.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = fragments.get(sel.name.value);
      if (fragment) {
        inlineFragments(fragment, fragments).selectionSet.selections.forEach(
          (sel) => {
            selections.push(sel);
          },
        );
      }
    } else if (sel.kind === Kind.FIELD && sel.selectionSet) {
      selections.push(inlineFragments(sel, fragments));
    } else {
      selections.push(sel);
    }
  });
  if (target.selectionSet) {
    target.selectionSet.selections = selections;
  }
  return target;
}
