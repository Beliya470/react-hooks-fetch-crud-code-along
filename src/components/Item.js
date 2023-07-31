import React from "react";

function Item({ item, onUpdateItem, onDeleteItem }) {
  function handleAddToCart() {
    const updatedItem = { ...item, isInCart: !item.isInCart };

    fetch(`http://localhost:5000/api/items/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    })
      .then((res) => res.json())
      .then((updatedItem) => {
        onUpdateItem(updatedItem);
      });
  }

  function handleDelete() {
    fetch(`http://localhost:5000/api/items/${item.id}`, {
      method: "DELETE",
    }).then(() => {
      onDeleteItem(item.id);
    });
  }

  return (
    <li className={item.isInCart ? "in-cart" : ""}>
      <h2>{item.name}</h2>
      <p>Category: {item.category}</p>
      <button
        onClick={handleAddToCart}
        className={item.isInCart ? "remove" : "add"}
      >
        {item.isInCart ? "Remove From" : "Add to"} Cart
      </button>
      <button onClick={handleDelete} className="remove">
        Delete
      </button>
    </li>
  );
}

export default Item;
