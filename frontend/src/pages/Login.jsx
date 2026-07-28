import { login } from "../api/authService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";

function Login() {
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");

      const response = await login(
        kullaniciAdi,
        sifre
      );

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      navigate("/dashboard");

    } catch (error) {

      setError("Kullanıcı adı veya şifre hatalı.");

    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f4f6f9",
      }}
    >
      <Paper
        sx={{
          padding: 4,
          width: 400,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          textAlign="center"
          mb={3}
        >
          Destek Sistemi
        </Typography>

        <TextField
          fullWidth
          label="Kullanıcı Adı"
          margin="normal"
          value={kullaniciAdi}
          onChange={(e) =>
            setKullaniciAdi(e.target.value)
          }
        />

        <TextField
          fullWidth
          type="password"
          label="Şifre"
          margin="normal"
          value={sifre}
          onChange={(e) =>
            setSifre(e.target.value)
          }
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
          >
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleLogin}
        >
          Giriş Yap
        </Button>
      </Paper>
    </div>
  );
}

export default Login;