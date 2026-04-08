using System;
using Microsoft.EntityFrameworkCore;
using project.Models;
using project.Modules.Payments.Repositories.Interfaces;

namespace project.Modules.Payment.Repositories.Implements;

public class OrderRepository : IOrderRepository
{
    private readonly DBContext _context;

    public  OrderRepository(DBContext context)
    {
        _context = context;
    }

    public async Task<Orders?> GetByIdAsync(string id)
    {
        return await _context.Orders
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Orders> AddAsync(Orders order)
    {
        await _context.Orders.AddAsync(order);
        return order;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

}
