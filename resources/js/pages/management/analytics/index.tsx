import { Head } from '@inertiajs/react';
import { BrainCircuit, Info, TrendingUp, BarChart as ChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AprioriInsight {
    antecedent: string;
    consequent: string;
    support: number;
    confidence: number;
}

interface Props {
    aprioriInsights: AprioriInsight[];
}

const breadcrumbs = [
    {
        title: 'AI Analytics',
        href: '/management/analytics',
    },
];

const chartConfig = {
    confidence: {
        label: "Confidence (%)",
        color: "var(--color-primary)",
    },
    support: {
        label: "Support (%)",
        color: "var(--color-chart-2)",
    },
} satisfies ChartConfig;

export default function AnalyticsIndex({ aprioriInsights = [] }: Props) {
    const chartData = aprioriInsights.map((insight) => ({
        name: `${insight.antecedent} → ${insight.consequent}`,
        confidence: Number((insight.confidence * 100).toFixed(1)),
        support: Number((insight.support * 100).toFixed(1)),
    }));

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Analitik AI" />
            <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <BrainCircuit className="h-8 w-8 text-primary" />
                            Dasbor Analitik AI
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Analisis Keranjang Belanja menggunakan algoritma Apriori untuk menemukan asosiasi produk.
                        </p>
                    </div>
                </div>

                <Alert className="bg-primary/5 border-primary/20">
                    <Info className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-primary font-bold">Bagaimana cara membaca data ini?</AlertTitle>
                    <AlertDescription className="mt-2 text-muted-foreground text-sm grid gap-2">
                        <p>
                            <strong>Support (Dukungan):</strong> Proporsi seberapa sering kedua produk tersebut muncul bersamaan di seluruh transaksi toko. Semakin tinggi berarti kombinasi ini sangat populer.
                        </p>
                        <p>
                            <strong>Confidence (Kepastian):</strong> Probabilitas/Peluang seorang pelanggan akan ikut memesan produk "Pasangan", setelah mereka dipastikan memesan produk "Utama".
                        </p>
                    </AlertDescription>
                </Alert>

                {aprioriInsights.length > 0 && (
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ChartIcon className="h-5 w-5 text-primary" />
                                Visualisasi Probabilitas
                            </CardTitle>
                            <CardDescription>
                                Perbandingan visual antara tingkat kepastian (Confidence) dan kepopuleran (Support)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full pt-4">
                                <ChartContainer config={chartConfig} className="h-full w-full">
                                    <BarChart
                                        accessibilityLayer
                                        data={chartData}
                                        margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted opacity-50" />
                                        <XAxis 
                                            dataKey="name" 
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tick={{fontSize: 12, fill: 'var(--color-muted-foreground)'}} 
                                        />
                                        <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{fill: 'var(--color-muted-foreground)'}} 
                                            tickFormatter={(val) => `${val}%`} 
                                        />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                                        <Bar dataKey="confidence" name="Confidence (%)" fill="var(--color-confidence)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                        <Bar dataKey="support" name="Support (%)" fill="var(--color-support)" radius={[4, 4, 0, 0]} opacity={0.6} maxBarSize={60} />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Pola Kombinasi Produk (Cross-Selling)
                        </CardTitle>
                        <CardDescription>
                            Pola yang ditemukan berdasarkan histori transaksi (Minimal Dukungan 5%, Kepastian 30%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {aprioriInsights.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Produk Utama (Antecedent)</TableHead>
                                            <TableHead className="w-[50px] text-center"></TableHead>
                                            <TableHead>Produk Pasangan (Consequent)</TableHead>
                                            <TableHead className="text-right">Support</TableHead>
                                            <TableHead className="text-right">Confidence</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {aprioriInsights.map((insight, index) => (
                                            <TableRow key={index} className="hover:bg-muted/30">
                                                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell className="font-semibold">{insight.antecedent}</TableCell>
                                                <TableCell className="text-muted-foreground text-center">→</TableCell>
                                                <TableCell className="font-bold text-primary">{insight.consequent}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className="bg-background">
                                                        {(insight.support * 100).toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge className={insight.confidence > 0.7 ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}>
                                                        {(insight.confidence * 100).toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <BrainCircuit className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                <p className="text-lg font-medium">Belum ada pola signifikan yang ditemukan.</p>
                                <p className="text-sm">Sistem membutuhkan lebih banyak data transaksi (minimal berisi 2 barang per pesanan) agar dapat meracik rekomendasi.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {aprioriInsights.length > 0 && (
                    <Card className="border border-primary/20 shadow-sm bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-primary" />
                                Rekomendasi Tindakan Bisnis
                            </CardTitle>
                            <CardDescription>
                                Berdasarkan pola algoritma di atas, berikut adalah langkah strategis yang direkomendasikan untuk Pemilik Bisnis/Manajer:
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-3 text-sm text-foreground/90">
                                <li>
                                    <strong>Penempatan Menu/Tampilan:</strong> Pastikan produk <strong>{aprioriInsights[0].consequent}</strong> diposisikan berdekatan atau mudah terlihat jika pelanggan sedang melirik <strong>{aprioriInsights[0].antecedent}</strong>.
                                </li>
                                <li>
                                    <strong>Teknik Kasir (Ucapan):</strong> Buat standar operasional agar Kasir selalu menawarkan <em>"Apakah mau ditambah {aprioriInsights[0].consequent}-nya sekalian, Kak?"</em> setiap kali pengunjung memesan <strong>{aprioriInsights[0].antecedent}</strong>.
                                </li>
                                {aprioriInsights.slice(0, 3).map((insight, index) => (
                                    <li key={index}>
                                        Pertimbangkan untuk meluncurkan Paket Promo Bundling <strong>"{insight.antecedent} + {insight.consequent}"</strong>. 
                                        {insight.confidence >= 0.8 ? " Data kami meyakinkan bahwa pelanggan punya intensi sangat tinggi untuk memesan format kombinasi ini." : " Pola menunjukkan bahwa produk ini lumayan sering dibeli bersilangan."}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppSidebarLayout>
    );
}
