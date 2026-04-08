using System;
using project.Models;


public interface IPaymentRepository
{
    Task<Payment> AddAsync(Payment payment);
    Task SaveChangesAsync();
    Task<Payment?> GetByIdAsync(string id);
    Task<Payment?> GetByTransactionIdAsync(string transactionId);


}
