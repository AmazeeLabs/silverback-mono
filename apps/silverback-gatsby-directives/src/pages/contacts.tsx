import { graphql, PageProps } from 'gatsby';
import React from 'react';

type ContactListQuery = {
  value?: string;
  parent?: string;
  argument?: string;
  allContacts: Array<{
    __typename: 'Employee' | 'Customer';
    name: string;
    email: string;
  }>;
};

export const query = graphql`
  query ContactList {
    value
    parent
    argument(msg: "argument value")
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
      <p>Schema value: {props.data.value}</p>
      <p>Parent value: {props.data.parent}</p>
      <p>Argument value: {props.data.argument}</p>
      <h1>Contacts</h1>
      <table>
        <th>
          <td>Name</td>
          <td>E-Mail</td>
        </th>
        {props.data.allContacts.map((contact) => (
          <tr key={contact.email}>
            <td>{contact.name}</td>
            <td>{contact.email}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
