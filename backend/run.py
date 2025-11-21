import sys
import os
from app import create_app, db
from app.models import User, Activity, Nutrition, Goal, CommunityPost, Challenge

app = create_app()


@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Activity': Activity,
        'Nutrition': Nutrition,
        'Goal': Goal,
        'CommunityPost': CommunityPost,
        'Challenge': Challenge
    }


@app.cli.command()
def init_db():
    """Initialize the database."""
    db.create_all()
    print('Database initialized!')


@app.cli.command()
def drop_db():
    """Drop all database tables."""
    db.drop_all()
    print('Database dropped!')


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'init-db':
        with app.app_context():
            db.create_all()
            print('Database initialized!')
    else:
        port = int(os.environ.get('PORT', 5000))
        debug = os.environ.get('FLASK_ENV', 'development') == 'development'
        app.run(debug=debug, host='0.0.0.0', port=port)



