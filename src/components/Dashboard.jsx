import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale
);

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "income",
    date: "",
    id: null,
  });
  const [errors, setErrors] = useState({
    description: "",
    amount: "",
    date: "",
  });

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions"));
    if (storedTransactions) {
      setTransactions(storedTransactions);
    }
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      description:
        formData.description.trim() === "" ? "Descrição é obrigatória." : "",
      amount:
        isNaN(formData.amount) || formData.amount <= 0
          ? "Valor deve ser um número positivo."
          : "",
      date: formData.date === "" ? "Data é obrigatória." : "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) return;

    if (formData.id) {
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === formData.id ? { ...formData } : transaction
      );
      setTransactions(updatedTransactions);
    } else {
      setTransactions([
        ...transactions,
        { ...formData, id: new Date().getTime() },
      ]);
    }

    setFormData({
      description: "",
      amount: "",
      type: "income",
      date: "",
      id: null,
    });
  };

  const handleEdit = (id) => {
    const transactionToEdit = transactions.find(
      (transaction) => transaction.id === id
    );
    setFormData(transactionToEdit);
  };

  const handleDelete = (id) => {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== id
    );
    setTransactions(updatedTransactions);
  };

  const calculateBalance = () => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (total, transaction) => total + parseFloat(transaction.amount),
        0
      );
    const expense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce(
        (total, transaction) => total + parseFloat(transaction.amount),
        0
      );
    return income - expense;
  };

  const chartData = {
    labels: ["Receitas", "Despesas"],
    datasets: [
      {
        data: [
          transactions
            .filter((transaction) => transaction.type === "income")
            .reduce(
              (total, transaction) => total + parseFloat(transaction.amount),
              0
            ),
          transactions
            .filter((transaction) => transaction.type === "expense")
            .reduce(
              (total, transaction) => total + parseFloat(transaction.amount),
              0
            ),
        ],
        backgroundColor: ["#4CAF50", "#FF5733"],
        hoverBackgroundColor: ["#45a049", "#d94c34"],
      },
    ],
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="card">
          <h3>Saldo Total</h3>
          <p>R$ {calculateBalance().toFixed(2)}</p>
        </div>

        <div className="card">
          <h3>Distribuição entre Receitas e Despesas</h3>
          <Pie data={chartData} />
        </div>

        <div className="card">
          <h3>{formData.id ? "Editar Transação" : "Adicionar Transação"}</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrição"
              required
            />
            {errors.description && (
              <p className="error">{errors.description}</p>
            )}

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Valor"
              required
            />
            {errors.amount && <p className="error">{errors.amount}</p>}

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            {errors.date && <p className="error">{errors.date}</p>}

            <button type="submit" className="submit-btn">
              {formData.id ? "Salvar" : "Adicionar"}
            </button>
          </form>
        </div>
      </div>

      <div className="transactions-list">
        <h3>Transações</h3>
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.description} - R$ {transaction.amount} -{" "}
              {transaction.type === "income" ? "Receita" : "Despesa"} -{" "}
              {transaction.date}
              <div>
                <button
                  onClick={() => handleEdit(transaction.id)}
                  className="edit-btn"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="delete-btn"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
