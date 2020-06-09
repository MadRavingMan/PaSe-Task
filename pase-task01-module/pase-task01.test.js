const { getWeekNo, commissionFeeCounter } = require('./pase-task01');

test('should output week number', () => {
    const weekNumber = getWeekNo('2020-06-08');
    expect(weekNumber).toBe(24);
});

test('should output cash in fee', () => {
    const naturalUser = { "date": "2016-01-05", "user_id": 1, "user_type": "natural", "type": "cash_in"
                        , "operation": { "amount": 200.00, "currency": "EUR" }};
    const juridicalUser = { "date": "2016-01-10", "user_id": 2, "user_type": "juridical", "type": "cash_in"
                        , "operation": { "amount": 1000000.00, "currency": "EUR" }};

    const calculatedNatural = commissionFeeCounter(naturalUser);
    expect(calculatedNatural).toBe('0.06');
    const calculatedJuridical = commissionFeeCounter(juridicalUser);
    expect(calculatedJuridical).toBe('5.00');
});

test('should output cash out natural users fees', () => {
    const naturalUser1 = { "date": "2016-01-06", "user_id": 1, "user_type": "natural", "type": "cash_out"
                        , "operation": { "amount": 30000, "currency": "EUR" } };
    const naturalUser2 = { "date": "2016-01-06", "user_id": 1, "user_type": "natural", "type": "cash_out"
                        , "operation": { "amount": 100, "currency": "EUR" } };
    const naturalUser3 = { "date": "2016-01-06", "user_id": 2, "user_type": "natural", "type": "cash_out"
                        , "operation": { "amount": 300, "currency": "EUR" } };
    const naturalUser4 = { "date": "2016-01-06", "user_id": 2, "user_type": "natural", "type": "cash_out"
                        , "operation": { "amount": 700, "currency": "EUR" } };

    const calculatedNatural1 = commissionFeeCounter(naturalUser1);
    expect(calculatedNatural1).toBe('87.00');
    const calculatedNatural2 = commissionFeeCounter(naturalUser2);
    expect(calculatedNatural2).toBe('0.30');
    const calculatedNatural3 = commissionFeeCounter(naturalUser3);
    expect(calculatedNatural3).toBe('0.00');
    const calculatedNatural4 = commissionFeeCounter(naturalUser4);
    expect(calculatedNatural4).toBe('0.00');
});

test('should output cash in fee for juridical persons', () => {
    const juridicalUser1 = { "date": "2016-01-06", "user_id": 1, "user_type": "juridical", "type": "cash_out"
                        , "operation": { "amount": 10, "currency": "EUR" } };
    const juridicalUser2 = { "date": "2016-01-06", "user_id": 1, "user_type": "juridical", "type": "cash_out"
                        , "operation": { "amount": 5000, "currency": "EUR" } };

    const calculatedJuridical1 = commissionFeeCounter(juridicalUser1);
    expect(calculatedJuridical1).toBe('0.50');
    const calculatedJuridical2 = commissionFeeCounter(juridicalUser2);
    expect(calculatedJuridical2).toBe('15.00');
});