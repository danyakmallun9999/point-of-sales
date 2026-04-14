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
            <Head title="AI Analytics" />
            <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <BrainCircuit className="h-8 w-8 text-primary" />
                            AI Analytics Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Market Basket Analysis using Apriori algorithm to discover product associations.
                        </p>
                    </div>
                </div>

                <Alert className="bg-primary/5 border-primary/20">
                    <Info className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-primary font-bold">How to read this data?</AlertTitle>
                    <AlertDescription className="mt-2 text-muted-foreground text-sm grid gap-2">
                        <p>
                            <strong>Support:</strong> The proportion of transactions that contain both products. A higher support means the combination is very popular.
                        </p>
                        <p>
                            <strong>Confidence:</strong> The probability that a customer will buy the "Consequent" product, given that they already bought the "Antecedent" product.
                        </p>
                    </AlertDescription>
                </Alert>

                {aprioriInsights.length > 0 && (
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ChartIcon className="h-5 w-5 text-primary" />
                                Probability Visualization
                            </CardTitle>
                            <CardDescription>
                                Visual comparison of predictability (Confidence) vs popularity (Support)
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
                                            tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} 
                                        />
                                        <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{fill: 'hsl(var(--muted-foreground))'}} 
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
                            Product Recommendations (Cross-Selling)
                        </CardTitle>
                        <CardDescription>
                            Discovered patterns based on historical transaction data (Minimum Support 5%, Confidence 30%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {aprioriInsights.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Primary Product (Antecedent)</TableHead>
                                            <TableHead className="w-[50px] text-center"></TableHead>
                                            <TableHead>Recommended Product (Consequent)</TableHead>
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
                                <p className="text-lg font-medium">No significant patterns discovered yet.</p>
                                <p className="text-sm">The algorithm needs more transaction data with multiple items per order to generate reliable recommendations.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
