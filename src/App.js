import { useState, useReducer, useEffect } from "react";
import "./App.css";

// Import your components
import ExpenseForm from "./components/ExpenseForm/ExpenseForm";
import ExpenseInfo from "./components/ExpenseInfo/ExpenseInfo";
import ExpenseList from "./components/ExpenseList/ExpenseList";

// Import React Toasts for notifications
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Firebase methods
import {
  doc,
  collection,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc
} from "firebase/firestore"; // Make sure to import these correctly
import { db } from "./firebaseInit"; // Import your Firebase configuration

// Define a reducer to manage the state
const reducer = (state, action) => {
  const { payload } = action;
  switch (action.type) {
    case "GET_EXPENSES": {
      return {
        expenses: payload.expenses
      };
    }
    case "ADD_EXPENSE": {
      return {
        expenses: [payload.expense, ...state.expenses]
      };
    }
    case "REMOVE_EXPENSE": {
      return {
        expenses: state.expenses.filter((expense) => expense.id !== payload.id)
      };
    }
    case "UPDATE_EXPENSE": {
      const expensesDuplicate = state.expenses;
      expensesDuplicate[payload.expensePos] = payload.expense;
      return {
        expenses: expensesDuplicate
      };
    }
    default:
      return state;
  }
};

function App() {
  // Initialize state using useReducer
  const [state, dispatch] = useReducer(reducer, { expenses: [] });

  // State to hold the expense being updated
  const [expenseToUpdate, setExpenseToUpdate] = useState(null);

  // Function to get data from Firebase
  const getData = async () => {
    const snapshot = await getDocs(collection(db, "expenses"));
    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Dispatch the data to the reducer
    dispatch({ type: "GET_EXPENSES", payload: { expenses } });
    toast.success("Expenses retrieved successfully.");
  };

  // Use useEffect to fetch data from Firebase when the component mounts
  useEffect(() => {
    getData();
  }, []);

  // Function to add a new expense
  const addExpense = async (expense) => {
    // Get a reference to the "expenses" collection in Firebase
    const expenseRef = collection(db, "expenses");

    // Add a new document to the collection and include the 'id' field
    const docRef = await addDoc(expenseRef, expense);

    // Dispatch the new expense with 'id' to the reducer
    dispatch({
      type: "ADD_EXPENSE",
      payload: { expense: { id: docRef.id, ...expense } }
    });

    toast.success("Expense added successfully.");
  };

  // Function to delete an expense
  const deleteExpense = async (id) => {
    // Get a reference to the specific expense document in Firebase
    const docRef = doc(db, "expenses", id);

    // Delete the document
    await deleteDoc(docRef);

    // Dispatch the action to remove the expense from the state
    dispatch({ type: "REMOVE_EXPENSE", payload: { id } });

    toast.success("Expense deleted successfully.");
  };

  // Function to reset the expenseToUpdate state
  const resetExpenseToUpdate = () => {
    setExpenseToUpdate(null);
  };

  // Function to update an expense
  const updateExpense = async (expense) => {
    // Find the position of the expense to be updated in the state
    const expensePos = state.expenses
      .map(function (exp) {
        return exp.id;
      })
      .indexOf(expense.id);

    // Check if the expense was found
    if (expensePos === -1) {
      return false;
    }

    // Get a reference to the specific expense document in Firebase
    const expenseRef = doc(db, "expenses", expense.id);

    // Update the expense document
    await updateDoc(expenseRef, expense);

    // Dispatch the action to update the expense in the state
    dispatch({ type: "UPDATE_EXPENSE", payload: { expensePos, expense } });

    toast.success("Expense updated successfully.");
  };

  return (
    <>
      <ToastContainer />
      <h2 className="mainHeading">Expense Tracker</h2>
      <div className="App">
        <ExpenseForm
          addExpense={addExpense}
          expenseToUpdate={expenseToUpdate}
          updateExpense={updateExpense}
          resetExpenseToUpdate={resetExpenseToUpdate}
        />
        <div className="expenseContainer">
          <ExpenseInfo expenses={state.expenses} />
          <ExpenseList
            expenses={state.expenses}
            deleteExpense={deleteExpense}
            changeExpenseToUpdate={setExpenseToUpdate}
          />
        </div>
      </div>
    </>
  );
}

export default App;
