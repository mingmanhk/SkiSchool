
interface PricingRule {
    id: string;
    name: string;
    condition: (context: any) => boolean;
    adjustment: (basePrice: number) => number;
}

// Example dynamic rules
const rules: PricingRule[] = [
    {
        id: 'weekend-surcharge',
        name: 'Weekend Surcharge',
        condition: (ctx) => {
            const date = new Date(ctx.date);
            const day = date.getDay();
            return day === 0 || day === 6; // Sunday or Saturday
        },
        adjustment: (price) => price + 1000 // Add $10.00
    },
    {
        id: 'early-bird',
        name: 'Early Bird Discount',
        condition: (ctx) => {
            if (!ctx.bookingDate || !ctx.classDate) return false;
            const diffTime = Math.abs(new Date(ctx.classDate).getTime() - new Date(ctx.bookingDate).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays > 30; // Booked > 30 days in advance
        },
        adjustment: (price) => price * 0.9 // 10% off
    }
];

export function calculateDynamicPrice(basePriceCents: number, context: { date: string, bookingDate?: string }) {
    let finalPrice = basePriceCents;
    const appliedRules: string[] = [];

    for (const rule of rules) {
        if (rule.condition(context)) {
            finalPrice = rule.adjustment(finalPrice);
            appliedRules.push(rule.name);
        }
    }

    return {
        finalPrice: Math.round(finalPrice),
        appliedRules
    };
}
