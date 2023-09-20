import { graphql, PageProps } from 'gatsby';
import React from 'react';

export const query = graphql`
  query ContactList {
    allContacts {
      __typename
      name
      email
    }
  }
`;

export default function Contacts(props: PageProps<ContactListQuery>) {
  return (
    <div>
      <h1>Contacts</h1>
      <table>
        <th>
          <td>Name</td>
          <td>E-Mail</td>
        </th>
        {props.data.allContacts?.map((contact) =>
          contact ? (
            <tr key={contact.email}>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
            </tr>
          ) : null,
        )}
      </table>
    </div>
  );
}
