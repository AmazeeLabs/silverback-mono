import { LinkType } from '@amazeelabs/bridge';
import { Link as WakuLink } from 'waku';

export const createLinkComponent: (Link: typeof WakuLink) => LinkType = (
  Link,
) =>
  function WakuLink({ href, children, ...props }) {
    return (
      <Link to={href || '/'} {...props}>
        {children}
      </Link>
    );
  };
