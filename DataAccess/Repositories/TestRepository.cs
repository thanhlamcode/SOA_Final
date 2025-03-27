﻿using Core.Entities;
using DataAccess.Context;
using DataAccess.IRepositories;
using Microsoft.EntityFrameworkCore;  

namespace DataAccess.Repositories
{
    public class TestRepository : ITestRepository
    {
        private readonly ApplicationDbContext _context;

        public TestRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Test> GetTestByIdAsync(int id)
        {
            return await _context.Tests.FindAsync(id);
        }

        public async Task<IEnumerable<Test>> GetAllTestsAsync()
        {
            return await _context.Tests.ToListAsync();
        }

        public async Task AddTestAsync(Test test)
        {
            await _context.Tests.AddAsync(test);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateTestAsync(Test test)
        {
            _context.Tests.Update(test);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteTestAsync(int id)
        {
            var test = await _context.Tests.FindAsync(id);
            if (test != null)
            {
                _context.Tests.Remove(test);
                await _context.SaveChangesAsync();
            }
        }
    }
}
