const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

class NovelService {
    constructor(client) {
        this.Novel = client.db().collection('novels');
        this.Genre = client.db().collection('genres');
    }

    // Auto-create genres if they don't exist
    async ensureGenresExist(genreNames) {
        if (!genreNames || genreNames.length === 0) return;

        for (const name of genreNames) {
            const exists = await this.Genre.findOne({ name });
            if (!exists) {
                console.log(`Auto-creating genre: ${name}`);
                await this.Genre.insertOne({
                    name,
                    slug: name.toLowerCase().replace(/\s+/g, '-'),
                    description: name,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    }

    // Save base64 image to file system
    saveImage(novelId, base64Image) {
        if (!base64Image || !base64Image.startsWith('data:image/')) {
            return base64Image; // Return as-is if not base64
        }

        try {
            // Extract image extension and data
            const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches) return base64Image;

            const ext = matches[1]; // jpg, png, etc.
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');

            // Create directory path: frontend/public/assets/Novel/<novelId>
            const frontendDir = path.join(__dirname, '../../../frontend/public/assets/Novel', novelId);
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(frontendDir)) {
                fs.mkdirSync(frontendDir, { recursive: true });
            }

            // Save file as cover.{ext}
            const fileName = `cover.${ext}`;
            const filePath = path.join(frontendDir, fileName);
            fs.writeFileSync(filePath, buffer);

            // Return relative path for frontend to use
            return `/assets/Novel/${novelId}/${fileName}`;
        } catch (error) {
            console.error('Error saving image:', error);
            return base64Image; // Return original if save fails
        }
    }

    // Extract novel data from request (for create - with defaults)
    extractNovelDataForCreate(payload) {
        const novel = {
            title: payload.title,
            author: payload.author,
            description: payload.description || '',
            genres: Array.isArray(payload.genres) ? [...payload.genres] : [],
            coverImage: payload.coverImage || '',
            status: payload.status || 'ongoing',
            views: payload.views || 0,
            likes: 0, // Will be calculated from favoritedBy.length
            favoritedBy: [], // Array of user IDs who favorited this novel
            createdBy: payload.createdBy || null, // User ID who created this novel
        };

        // Log with truncated coverImage
        const logData = { ...novel };
        if (logData.coverImage && logData.coverImage.length > 50) {
            logData.coverImage = logData.coverImage.substring(0, 50) + '...';
        }
        console.log('Extracted novel data for create:', logData);
        return novel;
    }

    // Extract novel data from request (for update - only provided fields)
    extractNovelDataForUpdate(payload) {
        const novel = {};
        
        // Only add fields that are explicitly provided
        if (payload.title !== undefined) novel.title = payload.title;
        if (payload.author !== undefined) novel.author = payload.author;
        if (payload.description !== undefined) novel.description = payload.description;
        if (payload.genres !== undefined) {
            // Ensure genres is a plain array (handle Proxy or reactive objects)
            novel.genres = Array.isArray(payload.genres) ? [...payload.genres] : [];
        }
        if (payload.coverImage !== undefined) novel.coverImage = payload.coverImage;
        if (payload.status !== undefined) novel.status = payload.status;
        if (payload.views !== undefined) novel.views = payload.views;
        if (payload.likes !== undefined) novel.likes = payload.likes;
        if (payload.favorite !== undefined) novel.favorite = payload.favorite;
        if (payload.createdBy !== undefined) novel.createdBy = payload.createdBy;

        // Log with truncated coverImage
        const logData = { ...novel };
        if (logData.coverImage && logData.coverImage.length > 50) {
            logData.coverImage = logData.coverImage.substring(0, 50) + '...';
        }
        console.log('Extracted novel data for update:', logData);
        return novel;
    }

    // Get all novels
    async findAll(filter = {}) {
        const novels = await this.Novel.find(filter).toArray();
        
        // Populate genres for each novel
        for (let novel of novels) {
            if (novel.genres && novel.genres.length > 0) {
                const genreObjects = await this.Genre.find({
                    name: { $in: novel.genres }
                }).toArray();
                
                // Replace genre names with full genre objects
                novel.genres = genreObjects.map(g => ({
                    _id: g._id,
                    name: g.name,
                    slug: g.slug
                }));
            }
        }
        
        return novels;
    }

    // Get novel by ID
    async findById(id) {
        const novel = await this.Novel.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        
        // Populate genres
        if (novel && novel.genres && novel.genres.length > 0) {
            const genreObjects = await this.Genre.find({
                name: { $in: novel.genres }
            }).toArray();
            
            novel.genres = genreObjects.map(g => ({
                _id: g._id,
                name: g.name,
                slug: g.slug
            }));
        }
        
        return novel;
    }

    // Create novel
    async create(payload) {
        const novel = this.extractNovelDataForCreate(payload);
        
        // Auto-create genres if they don't exist
        await this.ensureGenresExist(novel.genres);
        
        console.log('Inserting novel into database...');
        const result = await this.Novel.insertOne({
            ...novel,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('Novel inserted with ID:', result.insertedId);
        
        // Save image to file system if base64 provided
        if (novel.coverImage && novel.coverImage.startsWith('data:image/')) {
            console.log('Saving image to file system...');
            try {
                const imagePath = this.saveImage(result.insertedId.toString(), novel.coverImage);
                console.log('Image saved at:', imagePath);
                // Update novel with file path
                await this.Novel.updateOne(
                    { _id: result.insertedId },
                    { $set: { coverImage: imagePath } }
                );
                console.log('Novel updated with image path');
            } catch (error) {
                console.error('Error saving image for novel:', error);
                // Continue even if image save fails
            }
        }
        
        // Return the updated novel with image path
        console.log('Fetching created novel...');
        const createdNovel = await this.findById(result.insertedId);
        console.log('Returning novel:', createdNovel);
        return createdNovel;
    }

    // Update novel
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractNovelDataForUpdate(payload);
        
        // Auto-create genres if they don't exist
        if (update.genres) {
            await this.ensureGenresExist(update.genres);
        }
        
        // Save image to file system if base64 provided
        if (update.coverImage && update.coverImage.startsWith('data:image/')) {
            update.coverImage = this.saveImage(id, update.coverImage);
        }
        
        const result = await this.Novel.findOneAndUpdate(
            filter,
            { $set: { ...update, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        // Return the value directly (MongoDB driver returns { value: document })
        return result.value || result;
    }

    // Delete novel
    async delete(id) {
        const result = await this.Novel.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // Delete all novels
    async deleteAll() {
        const result = await this.Novel.deleteMany({});
        return result.deletedCount;
    }

    // Toggle favorite for a user
    async toggleFavorite(novelId, userId) {
        const novel = await this.findById(novelId);
        if (!novel) return null;

        const favoritedBy = novel.favoritedBy || [];
        const index = favoritedBy.indexOf(userId);
        
        let update;
        if (index > -1) {
            // User already favorited - remove them
            update = {
                $pull: { favoritedBy: userId },
                $set: { 
                    likes: Math.max(0, (novel.likes || 0) - 1),
                    updatedAt: new Date()
                }
            };
        } else {
            // User hasn't favorited - add them
            update = {
                $addToSet: { favoritedBy: userId },
                $set: { 
                    likes: (novel.likes || 0) + 1,
                    updatedAt: new Date()
                }
            };
        }

        const result = await this.Novel.findOneAndUpdate(
            { _id: ObjectId.isValid(novelId) ? new ObjectId(novelId) : null },
            update,
            { returnDocument: 'after' }
        );
        
        return result.value || result;
    }

    // Find novels favorited by user
    async findByUserId(userId) {
        return await this.Novel.find({ 
            favoritedBy: userId 
        }).toArray();
    }

    // Find novels created by user
    async findByCreator(userId) {
        return await this.Novel.find({ 
            createdBy: userId 
        }).toArray();
    }

    // Check if user has favorited a novel
    async isFavoritedBy(novelId, userId) {
        const novel = await this.findById(novelId);
        if (!novel) return false;
        return (novel.favoritedBy || []).includes(userId);
    }

    // Find favorite novels (deprecated - use findByUserId instead)
    async findFavorite() {
        return await this.findAll({ favorite: true });
    }
}

module.exports = NovelService;
