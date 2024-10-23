import {
  ExecutableDefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  InlineFragmentNode,
  Kind,
  SelectionNode,
} from 'graphql';

export function inlineFragments<
  TNode extends ExecutableDefinitionNode | FieldNode | InlineFragmentNode,
>(node: TNode, fragments: Map<string, FragmentDefinitionNode>): TNode {
  const selections: Array<SelectionNode> = [];
  const target = structuredClone(node);
  target.selectionSet?.selections.forEach((sel) => {
    if (sel.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = fragments.get(sel.name.value);
      if (fragment) {
        const fragmentSelections: Array<SelectionNode> = [];
        inlineFragments(fragment, fragments).selectionSet.selections.forEach(
          (sel) => {
            fragmentSelections.push(sel);
          },
        );
        selections.push({
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: fragment.typeCondition,
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: fragmentSelections,
          },
        });
      }
    } else if (sel.kind === Kind.INLINE_FRAGMENT) {
      const fragmentSelections: Array<SelectionNode> = [];
      const fragment = structuredClone(sel);
      inlineFragments(fragment, fragments).selectionSet.selections.forEach(
        (sel) => {
          fragmentSelections.push(sel);
        },
      );
      selections.push({
        kind: Kind.INLINE_FRAGMENT,
        typeCondition: sel.typeCondition,
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: fragmentSelections,
        },
      });
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
