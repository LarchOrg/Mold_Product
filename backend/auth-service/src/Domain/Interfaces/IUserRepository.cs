using AuthService.src.Domain.Entities;

namespace AuthService.src.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task<int>   CreateAsync(User user);
}
