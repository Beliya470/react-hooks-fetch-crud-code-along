import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ShoppingList from '../components/ShoppingList';

const mockItems = [
  { id: 1, name: 'Yogurt', category: 'Dairy', isInCart: false },
  { id: 2, name: 'Pomegranate', category: 'Produce', isInCart: false },
  { id: 3, name: 'Lettuce', category: 'Produce', isInCart: false },
];

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => {
    return res(ctx.json(mockItems));
  }),

  rest.post('/api/items', (req, res, ctx) => {
    const newItem = { ...req.body, id: Date.now(), isInCart: false };
    mockItems.push(newItem);
    return res(ctx.json(newItem));
  }),

  rest.patch('/api/items/:id', (req, res, ctx) => {
    const item = mockItems.find((item) => item.id.toString() === req.params.id);
    if (item) {
      item.isInCart = !item.isInCart;
      return res(ctx.json(item));
    } else {
      return res(ctx.status(404));
    }
  }),

  rest.delete('/api/items/:id', (req, res, ctx) => {
    const index = mockItems.findIndex((item) => item.id.toString() === req.params.id);
    if (index !== -1) {
      mockItems.splice(index, 1);
      return res(ctx.status(200));
    } else {
      return res(ctx.status(404));
    }
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays all the items from the server after the initial render', async () => {
  const { getAllByRole } = render(<ShoppingList />);

  await waitFor(() => {
    const items = getAllByRole('heading', { level: 2 });
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Yogurt');
    expect(items[1]).toHaveTextContent('Pomegranate');
    expect(items[2]).toHaveTextContent('Lettuce');
  });
});

test('adds a new item to the list when the ItemForm is submitted', async () => {
  const { getByLabelText, getByRole, getAllByRole } = render(<ShoppingList />);

  fireEvent.change(getByLabelText(/Name/i), { target: { value: 'Ice Cream' } });
  fireEvent.change(getByLabelText(/Category/i), { target: { value: 'Dessert' } });
  fireEvent.click(getByRole('button', { name: /Add Item/i }));

  await waitFor(() => {
    const items = getAllByRole('heading', { level: 2 });
    expect(items).toHaveLength(4);
    expect(items[3]).toHaveTextContent('Ice Cream');
  });
});

test('updates the isInCart status of an item when the Add/Remove from Cart button is clicked', async () => {
  const { getAllByRole, getByRole } = render(<ShoppingList />);

  await waitFor(() => {
    expect(getAllByRole('button', { name: /Add to Cart/i })).toHaveLength(3);
  });

  fireEvent.click(getAllByRole('button', { name: /Add to Cart/i })[0]);

  await waitFor(() => {
    expect(getByRole('button', { name: /Remove From Cart/i })).toBeInTheDocument();
  });
});

test('removes an item from the list when the delete button is clicked', async () => {
  const { getAllByRole } = render(<ShoppingList />);

  await waitFor(() => {
    expect(getAllByRole('heading', { level: 2 })).toHaveLength(3);
  });

  fireEvent.click(getAllByRole('button', { name: /Delete/i })[0]);

  await waitFor(() => {
    expect(getAllByRole('heading', { level: 2 })).toHaveLength(2);
  });
});
