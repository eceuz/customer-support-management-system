import { useEffect, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
} from "@mui/material";

import {
    getArizalar
} from "../api/yerindeDestekService";

import "../styles/callTable.css";


function YerindeDestekTable({
    refreshTrigger
}) {

    const [rows, setRows] =
        useState([]);

    const [arama, setArama] =
        useState("");


    // =========================================================
    // KAYITLARI YÜKLE
    // =========================================================

    useEffect(() => {

        loadArizalar();

    }, [refreshTrigger]);


    const loadArizalar = async () => {

        try {

            const response =
                await getArizalar();


            setRows(
                response.data || []
            );


        } catch (error) {

            console.error(
                "Yerinde destek kayıtları alınamadı:",
                error
            );

        }

    };


    // =========================================================
    // ARAMA
    // =========================================================

    const filtreliKayitlar =
        rows.filter((row) => {

            const aranan =
                arama
                    .toLocaleLowerCase(
                        "tr-TR"
                    );


            return (

                (
                    row.musteri_adi || ""
                )
                    .toLocaleLowerCase(
                        "tr-TR"
                    )
                    .includes(aranan)

                ||

                (
                    row.sube_adi || ""
                )
                    .toLocaleLowerCase(
                        "tr-TR"
                    )
                    .includes(aranan)

                ||

                (
                    row.sorun || ""
                )
                    .toLocaleLowerCase(
                        "tr-TR"
                    )
                    .includes(aranan)

                ||

                (
                    row.olusturan_kullanici_adi ||
                    ""
                )
                    .toLocaleLowerCase(
                        "tr-TR"
                    )
                    .includes(aranan)

                ||

                (
                    row.atanan_kullanici_adi ||
                    ""
                )
                    .toLocaleLowerCase(
                        "tr-TR"
                    )
                    .includes(aranan)

            );

        });


    // =========================================================
    // DURUM YAZISI
    // =========================================================

    const durumYazisi = (durum) => {

        switch (durum) {

            case "atama_bekliyor":
                return "Atama Bekliyor";

            case "atandi":
                return "Atandı";

            case "devam_ediyor":
                return "Devam Ediyor";

            case "tamamlandi":
                return "Tamamlandı";

            default:
                return durum || "-";

        }

    };


    // =========================================================
    // DURUM RENGİ
    // =========================================================

    const durumRengi = (durum) => {

        switch (durum) {

            case "atama_bekliyor":
                return "warning";

            case "atandi":
                return "info";

            case "devam_ediyor":
                return "primary";

            case "tamamlandi":
                return "success";

            default:
                return "default";

        }

    };


    // =========================================================
    // TARİH FORMATLAMA
    // =========================================================

    const tarihFormatla = (tarih) => {

        if (!tarih) {
            return "-";
        }


        const date =
            new Date(tarih);


        return (
            date.toLocaleDateString(
                "tr-TR"
            ) +
            " " +
            date.toLocaleTimeString(
                "tr-TR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            )
        );

    };


    // =========================================================
    // EKRAN
    // =========================================================

    return (

        <Paper
            elevation={0}
            className="call-table"
        >


            {/* BAŞLIK */}

            <div className="table-header">

                <Typography variant="h6">
                    Yerinde Destek Kayıtları
                </Typography>


                <TextField
                    size="small"
                    placeholder="Müşteri, şube, sorun..."
                    value={arama}
                    onChange={(e) =>
                        setArama(
                            e.target.value
                        )
                    }
                    sx={{
                        width: 280,
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment
                                    position="start"
                                >

                                    <SearchIcon
                                        fontSize="small"
                                    />

                                </InputAdornment>
                            ),
                        },
                    }}
                />

            </div>


            {/* TABLO */}

            <TableContainer>

                <Table
                    sx={{
                        tableLayout: "fixed",
                        width: "100%",
                    }}
                >

                    <TableHead>

                        <TableRow>

                            <TableCell width="13%">
                                Tarih
                            </TableCell>

                            <TableCell width="15%">
                                Müşteri
                            </TableCell>

                            <TableCell width="14%">
                                Şube
                            </TableCell>

                            <TableCell width="25%">
                                Sorun
                            </TableCell>

                            <TableCell width="11%">
                                Durum
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {filtreliKayitlar.map(
                            (row) => (

                                <TableRow
                                    key={
                                        row.ariza_kaydi_id
                                    }
                                    hover
                                >

                                    {/* TARİH */}

                                    <TableCell>

                                        <Typography
                                            fontSize="13px"
                                        >
                                            {tarihFormatla(
                                                row.olusturma_tarihi
                                            )}
                                        </Typography>

                                    </TableCell>


                                    {/* MÜŞTERİ */}

                                    <TableCell>

                                        <Typography
                                            fontWeight={600}
                                        >
                                            {
                                                row.musteri_adi ||
                                                "-"
                                            }
                                        </Typography>

                                    </TableCell>


                                    {/* ŞUBE */}

                                    <TableCell>

                                        <Typography>
                                            {
                                                row.sube_adi ||
                                                "-"
                                            }
                                        </Typography>

                                    </TableCell>


                                    {/* SORUN */}

                                    <TableCell
                                        sx={{
                                            wordBreak:
                                                "break-word",
                                            whiteSpace:
                                                "normal",
                                        }}
                                    >

                                        <Typography
                                            fontSize="13px"
                                        >
                                            {
                                                row.sorun ||
                                                "-"
                                            }
                                        </Typography>

                                    </TableCell>


                                    {/* DURUM */}

                                    <TableCell>

                                        <Chip
                                            label={
                                                durumYazisi(
                                                    row.durum
                                                )
                                            }
                                            color={
                                                durumRengi(
                                                    row.durum
                                                )
                                            }
                                            size="small"
                                        />

                                    </TableCell>


                                </TableRow>

                            )
                        )}


                        {/* KAYIT YOK */}

                        {
                            filtreliKayitlar.length ===
                                0 && (

                                <TableRow>

                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{
                                            py: 6,
                                        }}
                                    >

                                        <Typography
                                            color="text.secondary"
                                        >
                                            Yerinde destek kaydı bulunamadı.
                                        </Typography>

                                    </TableCell>

                                </TableRow>

                            )
                        }

                    </TableBody>

                </Table>

            </TableContainer>

        </Paper>

    );

}


export default YerindeDestekTable;