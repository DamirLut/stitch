import { expect } from 'chai';
import { yypRoomOrderNodeSchema } from './Yyp.js';

describe('yypRoomOrderNodeSchema', function () {
  describe('leaf (roomId) nodes', function () {
    it('parses a fully-specified roomId', function () {
      const result = yypRoomOrderNodeSchema.parse({
        roomId: { name: 'rm_test', path: 'rooms/rm_test/rm_test.yy' },
      });
      expect(result).to.deep.equal({
        roomId: { name: 'rm_test', path: 'rooms/rm_test/rm_test.yy' },
      });
    });

    it('infers path from name when path is missing', function () {
      const result = yypRoomOrderNodeSchema.parse({
        roomId: { name: 'rm_test' },
      });
      expect(result).to.deep.equal({
        roomId: { name: 'rm_test', path: 'rooms/rm_test/rm_test.yy' },
      });
    });

    it('does not override path when it is already set', function () {
      const result = yypRoomOrderNodeSchema.parse({
        roomId: { name: 'rm_test', path: 'rooms/rm_test/custom.yy' },
      });
      if (!('roomId' in result)) throw new Error('Expected roomId node');
      expect(result.roomId.path).to.equal('rooms/rm_test/custom.yy');
    });

    it('fails when roomId is missing name', function () {
      expect(() =>
        yypRoomOrderNodeSchema.parse({
          roomId: { path: 'rooms/rm_test/rm_test.yy' },
        }),
      ).to.throw();
    });

    it('fails when neither roomId nor children are present', function () {
      expect(() => yypRoomOrderNodeSchema.parse({})).to.throw();
    });
  });

  describe('group (children) nodes', function () {
    it('parses a group node with children', function () {
      const result = yypRoomOrderNodeSchema.parse({
        groupName: 'test_group',
        children: [
          {
            roomId: {
              name: 'test_room_a',
              path: 'rooms/test_room_a/test_room_a.yy',
            },
          },
          {
            roomId: {
              name: 'test_room_b',
              path: 'rooms/test_room_b/test_room_b.yy',
            },
          },
        ],
      });
      if (!('children' in result)) throw new Error('Expected group node');
      expect(result.groupName).to.equal('test_group');
      expect(result.children).to.have.length(2);
      expect(result.children[0]).to.deep.equal({
        roomId: {
          name: 'test_room_a',
          path: 'rooms/test_room_a/test_room_a.yy',
        },
      });
    });

    it('infers paths for children when path is missing', function () {
      const result = yypRoomOrderNodeSchema.parse({
        groupName: 'my_group',
        children: [{ roomId: { name: 'rm_child' } }],
      });
      if (!('children' in result)) throw new Error('Expected group node');
      expect(result.children[0]).to.deep.equal({
        roomId: { name: 'rm_child', path: 'rooms/rm_child/rm_child.yy' },
      });
    });

    it('fails when groupName is missing', function () {
      expect(() =>
        yypRoomOrderNodeSchema.parse({
          children: [
            { roomId: { name: 'rm_test', path: 'rooms/rm_test/rm_test.yy' } },
          ],
        }),
      ).to.throw();
    });
  });

  describe('mixed RoomOrderNodes array', function () {
    it('parses the full mixed structure from the sample', function () {
      const nodes = [
        { roomId: { name: 'rm_menu', path: 'rooms/rm_menu/rm_menu.yy' } },
        { roomId: { name: 'rm_game', path: 'rooms/rm_game/rm_game.yy' } },
        {
          groupName: 'test_group',
          children: [
            {
              roomId: {
                name: 'test_room_a',
                path: 'rooms/test_room_a/test_room_a.yy',
              },
            },
            {
              roomId: {
                name: 'test_room_c',
                path: 'rooms/test_room_c/test_room_c.yy',
              },
            },
          ],
        },
      ];
      const results = nodes.map((n) => yypRoomOrderNodeSchema.parse(n));
      expect(results[0]).to.deep.equal(nodes[0]);
      expect(results[1]).to.deep.equal(nodes[1]);
      if (!('children' in results[2])) throw new Error('Expected group node');
      expect(results[2].groupName).to.equal('test_group');
      expect(results[2].children).to.have.length(2);
    });
  });
});
