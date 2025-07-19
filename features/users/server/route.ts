import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import UserModel from '../model';
import { 
  loginUserSchema, 
  registerUserSchema, 
  updateProfileSchema, 
  changePasswordSchema,
  adminCreateUserSchema,
  adminEditUserSchema
} from '../schemas';
import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const app = new Hono()
  // Register endpoint
  .post('/register', async (c) => {
    try {
      await connectDB();
      
      const body = await c.req.json();
      const parsedData = registerUserSchema.parse(body);

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(parsedData.email);
      if (existingUser) {
        return c.json(
          { 
            success: false, 
            message: 'User with this email already exists' 
          }, 
          400
        );
      }

      // Create new user
      // Find company by custom id field
      const company = await (await import('../../companies/model')).default.findOne({ id: parsedData.companyId });
      if (!company) {
        return c.json({ success: false, message: 'Company not found' }, 400);
      }

      const newUser = new UserModel({
        email: parsedData.email,
        password: parsedData.password,
        name: parsedData.name,
        role: parsedData.role,
        companyId: company._id // Use the MongoDB ObjectId
      });
      await newUser.save();

      return c.json(
        {
          success: true,
          message: 'User registered successfully',
        },
        201
      );
    } catch (error) {
      console.error('Registration error:', error);
      return c.json(
        {
          success: false,
          message: 'Error registering user',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        400
      );
    }
  })

  // Login endpoint
  .post('/login', async (c) => {
    try {
      await connectDB();
      
      const body = await c.req.json();
      const { email, password } = loginUserSchema.parse(body);

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return c.json(
          { 
            success: false, 
            message: 'Invalid email or password' 
          }, 
          401
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return c.json(
          { 
            success: false, 
            message: 'Account is deactivated. Please contact administrator.' 
          }, 
          401
        );
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return c.json(
          { 
            success: false, 
            message: 'Invalid email or password' 
          }, 
          401
        );
      }

      // Generate JWT token
      const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      };
      
      const token = await sign(payload, JWT_SECRET);

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Set HTTP-only cookie
      setCookie(c, 'auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 // 24 hours
      });

      // Return user data (without password)
      const userData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        privileges: user.allPrivileges,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return c.json({
        success: true,
        message: 'Login successful',
        user: userData,
        token: token, // Also return token for localStorage fallback
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json(
        {
          success: false,
          message: 'Error during login',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  })

  // Logout endpoint
  .post('/logout', async (c) => {
    try {
      // Clear the auth cookie
      deleteCookie(c, 'auth-token');
      
      return c.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return c.json(
        {
          success: false,
          message: 'Error during logout'
        },
        500
      );
    }
  })

  // Get current user profile
  .get('/profile', async (c) => {
    try {
      await connectDB();
      
      // Get token from cookie or Authorization header
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      // Verify JWT token
      const payload = await verify(token, JWT_SECRET);
      
      // Find user
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      // Check if user is still active
      if (!user.isActive) {
        return c.json(
          { 
            success: false, 
            message: 'Account is deactivated' 
          }, 
          401
        );
      }

      // Return user data (without password)
      const userData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        privileges: user.allPrivileges,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return c.json({
        success: true,
        user: userData,
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      return c.json(
        {
          success: false,
          message: 'Error fetching user profile',
          error: error instanceof Error ? error.message : 'Invalid token'
        },
        401
      );
    }
  })

  // Update user profile
  .patch('/profile', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const body = await c.req.json();
      const parsedData = updateProfileSchema.parse(body);

      // Check if email is being changed and if it's already taken
      if (parsedData.email) {
        const existingUser = await UserModel.findByEmail(parsedData.email);
        if (existingUser && existingUser._id.toString() !== payload.userId) {
          return c.json(
            { 
              success: false, 
              message: 'Email is already taken by another user' 
            }, 
            400
          );
        }
      }

      // Update user
      const updatedUser = await UserModel.findByIdAndUpdate(
        payload.userId,
        parsedData,
        { new: true }
      );

      if (!updatedUser) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      return c.json({
        success: true,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      return c.json(
        {
          success: false,
          message: 'Error updating profile',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        400
      );
    }
  })

  // Change password
  .post('/change-password', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const body = await c.req.json();
      const { currentPassword, newPassword } = changePasswordSchema.parse(body);

      // Find user
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return c.json(
          { 
            success: false, 
            message: 'Current password is incorrect' 
          }, 
          400
        );
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return c.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Password change error:', error);
      return c.json(
        {
          success: false,
          message: 'Error changing password',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        400
      );
    }
  })

  // Admin: Get all users with filtering and pagination
  .get('/admin/users', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user is admin
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const user = await UserModel.findById(payload.userId);
      
      if (!user || user.role !== 'admin') {
        return c.json(
          { 
            success: false, 
            message: 'Admin access required' 
          }, 
          403
        );
      }

      // Get query parameters
      const searchQuery = c.req.query('searchQuery') || '';
      const role = c.req.query('role') || '';
      const isActive = c.req.query('isActive');
      const companyId = c.req.query('companyId') || '';
      const lastLoginFrom = c.req.query('lastLoginFrom') || '';
      const lastLoginTo = c.req.query('lastLoginTo') || '';
      const createdFrom = c.req.query('createdFrom') || '';
      const createdTo = c.req.query('createdTo') || '';
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');

      // Build filter query
      interface UserFilter {
        $or?: Array<{
          name?: { $regex: string; $options: string };
          email?: { $regex: string; $options: string };
        }>;
        role?: string;
        isActive?: boolean;
        companyId?: string;
        lastLoginAt?: {
          $gte?: Date;
          $lte?: Date;
        };
        createdAt?: {
          $gte?: Date;
          $lte?: Date;
        };
      }
      
      const filter: UserFilter = {};
      
      if (searchQuery) {
        filter.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      if (role) {
        filter.role = role;
      }

      if (isActive !== undefined && isActive !== '') {
        filter.isActive = isActive === 'true';
      }

      if (companyId) {
        filter.companyId = companyId;
      }

      if (lastLoginFrom || lastLoginTo) {
        filter.lastLoginAt = {};
        if (lastLoginFrom) {
          filter.lastLoginAt.$gte = new Date(lastLoginFrom);
        }
        if (lastLoginTo) {
          filter.lastLoginAt.$lte = new Date(lastLoginTo);
        }
      }

      if (createdFrom || createdTo) {
        filter.createdAt = {};
        if (createdFrom) {
          filter.createdAt.$gte = new Date(createdFrom);
        }
        if (createdTo) {
          filter.createdAt.$lte = new Date(createdTo);
        }
      }

      // Get total count
      const total = await UserModel.countDocuments(filter);

      // Get users with pagination
      const users = await UserModel.find(filter)
        .populate('companyId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-password');

      const totalPages = Math.ceil(total / limit);

      // Transform users data
      const usersData = users.map(user => {
        const companyId = user.companyId as string | { _id: string; name: string };
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          companyId: typeof companyId === 'object' && companyId?._id ? companyId._id.toString() : companyId,
          companyName: typeof companyId === 'object' && companyId?.name ? companyId.name : '',
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          privileges: user.allPrivileges,
        };
      });

      return c.json({
        success: true,
        users: usersData,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error('Get users error:', error);
      return c.json(
        {
          success: false,
          message: 'Error fetching users',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  })

  // Admin: Get user by ID
  .get('/admin/users/:id', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user is admin
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const currentUser = await UserModel.findById(payload.userId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        return c.json(
          { 
            success: false, 
            message: 'Admin access required' 
          }, 
          403
        );
      }

      const userId = c.req.param('id');
      const user = await UserModel.findById(userId)
        .populate('companyId', 'name')
        .select('-password');

      if (!user) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      const userData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        companyId: (user.companyId as unknown as { _id: string; name: string })._id.toString(),
        companyName: (user.companyId as unknown as { _id: string; name: string }).name,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        privileges: user.allPrivileges,
      };

      return c.json({
        success: true,
        user: userData,
      });
    } catch (error) {
      console.error('Get user details error:', error);
      return c.json(
        {
          success: false,
          message: 'Error fetching user details',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  })

  // Admin: Create new user
  .post('/admin/users', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user is admin
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const currentUser = await UserModel.findById(payload.userId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        return c.json(
          { 
            success: false, 
            message: 'Admin access required' 
          }, 
          403
        );
      }

      const body = await c.req.json();
      const parsedData = adminCreateUserSchema.parse(body);

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(parsedData.email);
      if (existingUser) {
        return c.json(
          { 
            success: false, 
            message: 'User with this email already exists' 
          }, 
          400
        );
      }

      // Find company by custom id field
      const company = await (await import('../../companies/model')).default.findOne({ id: parsedData.companyId });
      if (!company) {
        return c.json({ success: false, message: 'Company not found' }, 400);
      }

      // Create new user
      const newUser = new UserModel({
        email: parsedData.email,
        password: parsedData.password,
        name: parsedData.name,
        role: parsedData.role,
        companyId: company._id,
        isActive: parsedData.isActive,
      });
      await newUser.save();

      const userData = {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        companyId: company.id,
        companyName: company.name,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };

      return c.json(
        {
          success: true,
          message: 'User created successfully',
          user: userData,
        },
        201
      );
    } catch (error) {
      console.error('Create user error:', error);
      return c.json(
        {
          success: false,
          message: 'Error creating user',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        400
      );
    }
  })

  // Admin: Update user
  .patch('/admin/users/:id', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user is admin
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const currentUser = await UserModel.findById(payload.userId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        return c.json(
          { 
            success: false, 
            message: 'Admin access required' 
          }, 
          403
        );
      }

      const userId = c.req.param('id');
      const body = await c.req.json();
      const parsedData = adminEditUserSchema.parse(body);

      // Check if email is being changed and if it's already taken
      if (parsedData.email) {
        const existingUser = await UserModel.findByEmail(parsedData.email);
        if (existingUser && existingUser._id.toString() !== userId) {
          return c.json(
            { 
              success: false, 
              message: 'Email is already taken by another user' 
            }, 
            400
          );
        }
      }

      // Find company by custom id field if companyId is being updated
      let companyObjectId;
      if (parsedData.companyId) {
        const company = await (await import('../../companies/model')).default.findOne({ id: parsedData.companyId });
        if (!company) {
          return c.json({ success: false, message: 'Company not found' }, 400);
        }
        companyObjectId = company._id;
      }

      // Update user
      const updateData = {
        ...parsedData,
        ...(companyObjectId && { companyId: companyObjectId }),
      };

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );

      if (!updatedUser) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      return c.json({
        success: true,
        message: 'User updated successfully',
      });
    } catch (error) {
      console.error('Update user error:', error);
      return c.json(
        {
          success: false,
          message: 'Error updating user',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        400
      );
    }
  })

  // Admin: Delete user (soft delete by deactivating)
  .delete('/admin/users/:id', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user is admin
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const currentUser = await UserModel.findById(payload.userId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        return c.json(
          { 
            success: false, 
            message: 'Admin access required' 
          }, 
          403
        );
      }

      const userId = c.req.param('id');

      // Prevent admin from deleting themselves
      if (userId === payload.userId) {
        return c.json(
          { 
            success: false, 
            message: 'Cannot delete your own account' 
          }, 
          400
        );
      }

      // Soft delete by deactivating user
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );

      if (!updatedUser) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      return c.json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return c.json(
        {
          success: false,
          message: 'Error deactivating user',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  });

export default app;