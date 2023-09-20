import type { SilverbackResolver } from '@amazeelabs/gatsby-source-silverback';
import { SilverbackSource } from '@amazeelabs/gatsby-source-silverback/build/types.js';

type Contact = {
  name: string;
  email: string;
};

type Employee = {
  __typename: 'Employee';
  id: string;
  role: string;
} & Contact;

type Customer = {
  __typename: 'Customer';
  id: string;
} & Contact;

export const sourceEmployees: SilverbackSource<Employee> = () => {
  return [
    [
      'john',
      {
        __typename: 'Employee',
        id: 'john',
        name: 'John Doe',
        email: 'john.doe@my.company',
        role: 'developer',
      },
    ],
    [
      'jane',
      {
        __typename: 'Employee',
        id: 'jane',
        name: 'Jane Doe',
        email: 'jane.doe@my.company',
        role: 'ceo',
      },
    ],
  ];
};

export const sourceCustomers: SilverbackSource<Customer> = () => {
  return [
    [
      'frank',
      {
        __typename: 'Customer',
        id: 'frank',
        name: 'Frank Sinatra',
        email: 'frank@another.company',
      },
    ],
    [
      'elvis',
      {
        __typename: 'Customer',
        id: 'elvis',
        name: 'Elvis Presley',
        email: 'elvis@another.company',
      },
    ],
  ];
};

export const allContacts: SilverbackResolver = async (_, __, context) => {
  return (
    await context.nodeModel.findAll({
      type: 'Contact',
    })
  ).entries;
};

export const getPerson: SilverbackResolver = async (_, args, context) => {
  return await context.nodeModel.findOne({
    type: 'Contact',
    query: {
      filter: {
        id: {
          eq: args.id,
        },
      },
    },
  });
};
